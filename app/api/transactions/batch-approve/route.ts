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
      // Group transactions by parishId + contactId combination
      // Only transactions with SAME parish AND SAME contact can be merged
      // Transactions without contact (no-contact) will get individual receipts
      const groupedTransactions = new Map<string, (Income | Expense)[]>();

      for (const t of transactions) {
        const parishId = t.parishId.toString();
        const contactId = type === 'income'
          ? ((t as Income).senderId?.toString() || '')
          : ((t as Expense).receiverId?.toString() || '');

        // If no contact, each transaction gets its own receipt (use unique key)
        // If has contact, group by parishId + contactId
        const groupKey = contactId
          ? `${parishId}::${contactId}`
          : `individual::${t._id!.toString()}`;

        if (!groupedTransactions.has(groupKey)) {
          groupedTransactions.set(groupKey, []);
        }
        groupedTransactions.get(groupKey)!.push(t);
      }

      // Create separate receipt for each group
      const year = now.getFullYear();
      let receiptCount = await receiptsCollection.countDocuments({
        receiptNo: { $regex: `^REC-${year}-` }
      });

      for (const [, groupTransactions] of groupedTransactions) {
        receiptCount++;
        const receiptNo = `REC-${year}-${String(receiptCount).padStart(4, '0')}`;

        // Calculate total amount for this group
        const totalAmount = groupTransactions.reduce((sum, t) => sum + t.amount, 0);

        // Build items array with details
        const items = groupTransactions.map(t => ({
          referenceId: t._id!,
          code: type === 'income' ? (t as Income).incomeCode : (t as Expense).expenseCode,
          amount: t.amount,
          date: type === 'income' ? (t as Income).incomeDate : (t as Expense).expenseDate,
          payerPayee: type === 'income' ? (t as Income).payerName : (t as Expense).payeeName,
          description: t.description
        }));

        // Get payers/payees for display
        const payerPayees = groupTransactions
          .map(t => type === 'income' ? (t as Income).payerName : (t as Expense).payeeName)
          .filter(Boolean);
        const payerPayeeStr = payerPayees.length > 0
          ? payerPayees[0] // Use first one since they should all be the same contact
          : '';

        // Build description
        const descriptions = groupTransactions.map(t => t.description).filter(Boolean);
        const description = descriptions.length > 0
          ? descriptions.join('; ')
          : `Phiếu ${type === 'income' ? 'thu' : 'chi'} tổng hợp ${groupTransactions.length} khoản`;

        const groupObjectIds = groupTransactions.map(t => t._id!);

        const newReceipt: Receipt = {
          receiptNo,
          receiptType: type,
          referenceIds: groupObjectIds,
          parishId: groupTransactions[0].parishId,
          amount: totalAmount,
          receiptDate: now,
          payerPayee: payerPayeeStr || '',
          description,
          items,
          createdBy: userId,
          createdAt: now
        };

        const receiptResult = await receiptsCollection.insertOne(newReceipt);
        receipts.push({ ...newReceipt, _id: receiptResult.insertedId });

        // Update transactions in this group with the receiptId
        await transactionCollection.updateMany(
          { _id: { $in: groupObjectIds } },
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
