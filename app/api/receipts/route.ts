import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { Receipt } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const receiptsCollection = await getCollection('receipts');

    const query: any = {};
    if (status && status !== 'all') query.status = status;

    const receipts = await receiptsCollection
      .find(query)
      .sort({ issuedAt: -1 })
      .limit(100)
      .toArray();

    const formattedReceipts = receipts.map((receipt) => ({
      _id: receipt._id.toString(),
      receiptNo: receipt.receiptNo,
      transactionId: receipt.transactionId,
      parishName: receipt.parishName,
      fundName: receipt.fundName,
      amount: receipt.amount,
      issuedAt: receipt.issuedAt,
      issuedBy: receipt.issuedBy,
      status: receipt.status,
    }));

    return NextResponse.json(formattedReceipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.transactionId || !body.parishName || !body.fundName || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const receiptsCollection = await getCollection('receipts');

    // Generate receipt number: PT-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await receiptsCollection.countDocuments({
      receiptNo: { $regex: `^PT-${year}-` }
    });
    const receiptNo = `PT-${year}-${String(count + 1).padStart(4, '0')}`;

    const receipt: Omit<Receipt, '_id'> = {
      receiptNo,
      transactionId: body.transactionId,
      parishName: body.parishName,
      fundName: body.fundName,
      amount: parseFloat(body.amount),
      issuedBy: body.issuedBy,
      issuedAt: new Date(),
      status: body.status || 'draft',
      createdAt: new Date(),
    };

    const result = await receiptsCollection.insertOne(receipt as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...receipt } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
