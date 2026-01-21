import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Receipt } from '@/lib/schemas';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const receiptType = searchParams.get('receiptType');
    const parishId = searchParams.get('parishId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDatabase();
    const collection = db.collection<Receipt>('receipts');

    const filter: any = {};

    if (receiptType && receiptType !== 'all') {
      filter.receiptType = receiptType;
    }

    if (parishId) {
      filter.parishId = new ObjectId(parishId);
    }

    if (startDate || endDate) {
      filter.receiptDate = {};
      if (startDate) {
        filter.receiptDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.receiptDate.$lte = new Date(endDate);
      }
    }

    const receipts = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      data: receipts,
      total: receipts.length
    });

  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}
