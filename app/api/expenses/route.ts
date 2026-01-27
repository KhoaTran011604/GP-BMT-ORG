import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Expense } from '@/lib/schemas';
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
    const status = searchParams.get('status');
    const parishId = searchParams.get('parishId');
    const categoryId = searchParams.get('categoryId');
    const fundId = searchParams.get('fundId');
    const fiscalYear = searchParams.get('fiscalYear');
    const fiscalPeriod = searchParams.get('fiscalPeriod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDatabase();
    const collection = db.collection<Expense>('expenses');

    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (parishId) {
      filter.parishId = new ObjectId(parishId);
    }

    if (categoryId) {
      filter.categoryId = new ObjectId(categoryId);
    }

    if (fundId) {
      filter.fundId = new ObjectId(fundId);
    }

    if (fiscalYear) {
      filter.fiscalYear = parseInt(fiscalYear);
    }

    if (fiscalPeriod) {
      filter.fiscalPeriod = parseInt(fiscalPeriod);
    }

    if (startDate || endDate) {
      filter.expenseDate = {};
      if (startDate) {
        filter.expenseDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.expenseDate.$lte = new Date(endDate);
      }
    }

    const expenses = await collection
      .find(filter)
      .sort({ requestedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      data: expenses,
      total: expenses.length
    });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
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

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const allowedRoles = ['super_admin', 'cha_xu', 'thu_ky'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      parishId,
      categoryId,
      fundId,
      amount,
      paymentMethod,
      bankAccountId,
      bankAccount,
      payeeName,
      receiverId,
      description,
      expenseDate,
      images,
      notes
    } = body;

    if (!parishId || !amount || !expenseDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<Expense>('expenses');

    const year = new Date(expenseDate).getFullYear();
    const count = await collection.countDocuments({
      expenseCode: { $regex: `^EXP-${year}-` }
    });
    const expenseCode = `EXP-${year}-${String(count + 1).padStart(4, '0')}`;

    const now = new Date();
    const newExpense: Expense = {
      expenseCode,
      parishId: new ObjectId(parishId),
      categoryId: categoryId ? new ObjectId(categoryId) : undefined,
      fundId: fundId ? new ObjectId(fundId) : undefined,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'offline',
      bankAccountId: bankAccountId ? new ObjectId(bankAccountId) : undefined,
      bankAccount,
      payeeName,
      receiverId: receiverId ? new ObjectId(receiverId) : undefined,
      description,
      fiscalYear: year,
      fiscalPeriod: new Date(expenseDate).getMonth() + 1,
      expenseDate: new Date(expenseDate),
      images: images || [],
      status: 'pending',
      requestedBy: new ObjectId(decoded.userId),
      requestedAt: now,
      notes,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newExpense);

    return NextResponse.json({
      data: { ...newExpense, _id: result.insertedId },
      message: 'Expense created successfully'
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
