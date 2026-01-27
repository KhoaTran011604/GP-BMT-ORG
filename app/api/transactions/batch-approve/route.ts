import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Income, Expense, Receipt } from '@/lib/schemas';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only super_admin and cha_quan_ly can batch approve
    const allowedRoles = ['super_admin', 'cha_quan_ly'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ids, type, createCombinedReceipt } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No transaction IDs provided' },
        { status: 400 }
      );
    }

    if (!type || !['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const transactionCollection = type === 'income'
      ? db.collection<Income>('incomes')
      : db.collection<Expense>('expenses');
    const receiptsCollection = db.collection<Receipt>('receipts');

    const now = new Date();
    const userId = new ObjectId(decoded.userId);

    // Fetch all transactions
    const objectIds = ids.map(id => new ObjectId(id));
    const transactions = await transactionCollection
      .find({
        _id: { $in: objectIds },
        status: 'pending'
      })
      .toArray();

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No pending transactions found' },
        { status: 400 }
      );
    }

    // Update all transactions to approved
    const updateResult = await transactionCollection.updateMany(
      { _id: { $in: objectIds }, status: 'pending' },
      {
        $set: {
          status: 'approved',
          [type === 'income' ? 'verifiedBy' : 'approvedBy']: userId,
          [type === 'income' ? 'verifiedAt' : 'approvedAt']: now,
          updatedAt: now
        }
      }
    );

    const receipts: Receipt[] = [];

    if (createCombinedReceipt !== false) {
      // Create individual receipt for each transaction
      const year = now.getFullYear();
      let receiptCount = await receiptsCollection.countDocuments({
        receiptNo: { $regex: `^REC-${year}-` }
      });

      for (const transaction of transactions) {
        receiptCount++;
        const receiptNo = `REC-${year}-${String(receiptCount).padStart(4, '0')}`;

        // Build items array with single transaction detail
        const items = [{
          referenceId: transaction._id!,
          code: type === 'income' ? (transaction as Income).incomeCode : (transaction as Expense).expenseCode,
          amount: transaction.amount,
          date: type === 'income' ? (transaction as Income).incomeDate : (transaction as Expense).expenseDate,
          payerPayee: type === 'income' ? (transaction as Income).payerName : (transaction as Expense).payeeName,
          description: transaction.description
        }];

        // Get payer/payee for display
        const payerPayeeStr = type === 'income'
          ? (transaction as Income).payerName || ''
          : (transaction as Expense).payeeName || '';

        // Use transaction description or generate default
        const description = transaction.description ||
          `Phiếu ${type === 'income' ? 'thu' : 'chi'} ${type === 'income' ? (transaction as Income).incomeCode : (transaction as Expense).expenseCode}`;

        const newReceipt: Receipt = {
          receiptNo,
          receiptType: type,
          referenceIds: [transaction._id!],
          parishId: transaction.parishId,
          amount: transaction.amount,
          receiptDate: now,
          payerPayee: payerPayeeStr,
          description,
          items,
          createdBy: userId,
          createdAt: now
        };

        const receiptResult = await receiptsCollection.insertOne(newReceipt);
        receipts.push({ ...newReceipt, _id: receiptResult.insertedId });

        // Update transaction with the receiptId
        await transactionCollection.updateOne(
          { _id: transaction._id },
          {
            $set: {
              receiptId: receiptResult.insertedId,
              updatedAt: now
            }
          }
        );
      }
    }

    // Build response message
    const receiptMessage = receipts.length > 0
      ? receipts.length === 1
        ? ` và tạo phiếu ${receipts[0].receiptNo}`
        : ` và tạo ${receipts.length} phiếu (${receipts.map(r => r.receiptNo).join(', ')})`
      : '';

    return NextResponse.json({
      data: {
        approvedCount: updateResult.modifiedCount,
        receipts,
        receipt: receipts.length > 0 ? receipts[0] : null // For backward compatibility
      },
      message: `Đã duyệt ${updateResult.modifiedCount} khoản ${type === 'income' ? 'thu' : 'chi'}${receiptMessage}`
    });

  } catch (error) {
    console.error('Error batch approving transactions:', error);
    return NextResponse.json(
      { error: 'Failed to batch approve transactions' },
      { status: 500 }
    );
  }
}
