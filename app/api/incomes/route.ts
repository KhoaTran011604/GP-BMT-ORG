import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Income } from '@/lib/schemas';
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
    const fundId = searchParams.get('fundId');
    const fiscalYear = searchParams.get('fiscalYear');
    const fiscalPeriod = searchParams.get('fiscalPeriod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const rentalContractId = searchParams.get('rentalContractId');

    const db = await getDatabase();
    const collection = db.collection<Income>('incomes');

    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (parishId) {
      filter.parishId = new ObjectId(parishId);
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
      filter.incomeDate = {};
      if (startDate) {
        filter.incomeDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.incomeDate.$lte = new Date(endDate);
      }
    }

    // Filter by rental contract ID
    if (rentalContractId) {
      filter.rentalContractId = new ObjectId(rentalContractId);
    }

    const incomes = await collection
      .find(filter)
      .sort({ submittedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      data: incomes,
      total: incomes.length
    });

  } catch (error) {
    console.error('Error fetching incomes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incomes' },
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
      fundId,
      amount,
      paymentMethod,
      bankAccountId,
      bankAccount,
      payerName,
      description,
      incomeDate,
      images,
      notes
    } = body;

    if (!parishId || !fundId || !amount || !incomeDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<Income>('incomes');

    const year = new Date(incomeDate).getFullYear();
    const count = await collection.countDocuments({
      incomeCode: { $regex: `^INC-${year}-` }
    });
    const incomeCode = `INC-${year}-${String(count + 1).padStart(4, '0')}`;

    const now = new Date();
    const newIncome: Income = {
      incomeCode,
      parishId: new ObjectId(parishId),
      fundId: new ObjectId(fundId),
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'offline',
      bankAccountId: bankAccountId ? new ObjectId(bankAccountId) : undefined,
      bankAccount,
      payerName,
      description,
      fiscalYear: year,
      fiscalPeriod: new Date(incomeDate).getMonth() + 1,
      incomeDate: new Date(incomeDate),
      images: images || [],
      status: 'pending',
      submittedBy: new ObjectId(decoded.userId),
      submittedAt: now,
      notes,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newIncome);

    return NextResponse.json({
      data: { ...newIncome, _id: result.insertedId },
      message: 'Income created successfully'
    });

  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    );
  }
}
