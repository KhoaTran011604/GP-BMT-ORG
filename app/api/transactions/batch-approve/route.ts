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

    // Validate all transactions belong to the same parish
    const parishIds = new Set(transactions.map(t => t.parishId.toString()));
    if (parishIds.size > 1) {
      return NextResponse.json(
        { error: 'Các khoản thu/chi phải cùng giáo xứ để gộp vào một phiếu' },
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

    let receipt: Receipt | null = null;

    if (createCombinedReceipt !== false) {
      // Create combined receipt
      const year = now.getFullYear();
      const count = await receiptsCollection.countDocuments({
        receiptNo: { $regex: `^REC-${year}-` }
      });
      const receiptNo = `REC-${year}-${String(count + 1).padStart(4, '0')}`;

      // Calculate total amount
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

      // Build items array with details
      const items = transactions.map(t => ({
        referenceId: t._id!,
        code: type === 'income' ? (t as Income).incomeCode : (t as Expense).expenseCode,
        amount: t.amount,
        date: type === 'income' ? (t as Income).incomeDate : (t as Expense).expenseDate,
        payerPayee: type === 'income' ? (t as Income).payerName : (t as Expense).payeeName,
        description: t.description
      }));

      // Get payers/payees for display
      const payerPayees = transactions
        .map(t => type === 'income' ? (t as Income).payerName : (t as Expense).payeeName)
        .filter(Boolean);
      const payerPayeeStr = payerPayees.length > 0
        ? payerPayees.length === 1
          ? payerPayees[0]
          : `${payerPayees.length} ${type === 'income' ? 'người nộp' : 'người nhận'}`
        : '';

      // Build description
      const descriptions = transactions.map(t => t.description).filter(Boolean);
      const description = descriptions.length > 0
        ? descriptions.join('; ')
        : `Phiếu ${type === 'income' ? 'thu' : 'chi'} tổng hợp ${transactions.length} khoản`;

      const newReceipt: Receipt = {
        receiptNo,
        receiptType: type,
        referenceIds: objectIds,
        parishId: transactions[0].parishId,
        amount: totalAmount,
        receiptDate: now,
        payerPayee: payerPayeeStr || '',
        description,
        items,
        createdBy: userId,
        createdAt: now
      };

      const receiptResult = await receiptsCollection.insertOne(newReceipt);
      receipt = { ...newReceipt, _id: receiptResult.insertedId };

      // Update all transactions with the receiptId for quick lookup
      await transactionCollection.updateMany(
        { _id: { $in: objectIds } },
        {
          $set: {
            receiptId: receiptResult.insertedId,
            updatedAt: now
          }
        }
      );
    }

    return NextResponse.json({
      data: {
        approvedCount: updateResult.modifiedCount,
        receipt
      },
      message: `Đã duyệt ${updateResult.modifiedCount} khoản ${type === 'income' ? 'thu' : 'chi'}${receipt ? ` và tạo phiếu ${receipt.receiptNo}` : ''}`
    });

  } catch (error) {
    console.error('Error batch approving transactions:', error);
    return NextResponse.json(
      { error: 'Failed to batch approve transactions' },
      { status: 500 }
    );
  }
}
