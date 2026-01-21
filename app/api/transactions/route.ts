import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { Transaction } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

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
    const parishId = searchParams.get('parishId');
    const fundId = searchParams.get('fundId');
    const status = searchParams.get('status');
    const period = searchParams.get('period'); // Format: YYYY-MM

    const transactionsCollection = await getCollection('transactions');

    const query: any = {};
    if (parishId) query.parishId = new ObjectId(parishId);
    if (fundId) query.fundId = new ObjectId(fundId);
    if (status) query.status = status;

    // Filter by period (YYYY-MM)
    if (period) {
      const [year, month] = period.split('-').map(Number);
      if (year && month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        query.submittedAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }
    }

    const transactions = await transactionsCollection
      .find(query)
      .sort({ submittedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
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

    if (!body.parishId || !body.fundId || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transactionsCollection = await getCollection('transactions');

    const transaction: Omit<Transaction, '_id'> = {
      parishId: new ObjectId(body.parishId),
      fundId: new ObjectId(body.fundId),
      amount: parseFloat(body.amount),
      paymentMethod: body.paymentMethod || 'offline',
      screenshotUrl: body.screenshotUrl,
      receiptNo: body.receiptNo,
      fiscalYear: body.fiscalYear || new Date().getFullYear(),
      fiscalPeriod: body.fiscalPeriod || 1,
      status: 'pending',
      submittedBy: new ObjectId(payload.userId),
      submittedAt: new Date(),
      notes: body.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await transactionsCollection.insertOne(transaction as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...transaction } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
