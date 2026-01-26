import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Receipt, Income, Expense, Parish, Fund, MediaFile } from '@/lib/schemas';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    const receiptsCollection = db.collection<Receipt>('receipts');
    const incomesCollection = db.collection<Income>('incomes');
    const expensesCollection = db.collection<Expense>('expenses');
    const parishesCollection = db.collection<Parish>('parishes');
    const fundsCollection = db.collection<Fund>('funds');
    const mediaFilesCollection = db.collection<MediaFile>('media_files');

    // Get the receipt
    const receipt = await receiptsCollection.findOne({ _id: new ObjectId(id) });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Determine if this is a combined receipt (multiple transactions)
    const isCombined = receipt.referenceIds && receipt.referenceIds.length > 0;
    const transactionIds = isCombined
      ? receipt.referenceIds
      : receipt.referenceId
        ? [receipt.referenceId]
        : [];

    // Get the related transactions (income or expense)
    let transactions: (Income | Expense)[] = [];
    if (transactionIds.length > 0) {
      if (receipt.receiptType === 'income') {
        transactions = await incomesCollection
          .find({ _id: { $in: transactionIds } })
          .toArray();
      } else {
        transactions = await expensesCollection
          .find({ _id: { $in: transactionIds } })
          .toArray();
      }
    }

    // For backward compatibility, also return single transaction
    const transaction = transactions.length === 1 ? transactions[0] : null;

    // Get parish info
    const parish = receipt.parishId
      ? await parishesCollection.findOne({ _id: receipt.parishId })
      : null;

    // Get fund info (if available from first transaction)
    let fund: Fund | null = null;
    if (transactions.length > 0 && 'fundId' in transactions[0] && transactions[0].fundId) {
      fund = await fundsCollection.findOne({ _id: transactions[0].fundId });
    }

    // Get related media files for all transactions
    const mediaFiles = transactionIds.length > 0
      ? await mediaFilesCollection
          .find({
            entityType: receipt.receiptType,
            entityId: { $in: transactionIds },
            status: 'active'
          })
          .toArray()
      : [];

    return NextResponse.json({
      data: {
        receipt,
        transaction, // Single transaction for backward compatibility
        transactions, // Array of all transactions for combined receipts
        isCombined,
        parish,
        fund,
        mediaFiles
      }
    });

  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}
