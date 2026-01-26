import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { BankAccount } from '@/lib/schemas';
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
    const accountType = searchParams.get('accountType');
    const parishId = searchParams.get('parishId');

    const db = await getDatabase();
    const collection = db.collection<BankAccount>('bank_accounts');

    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (accountType && accountType !== 'all') {
      filter.accountType = accountType;
    }

    if (parishId) {
      filter.parishId = new ObjectId(parishId);
    }

    const accounts = await collection
      .find(filter)
      .sort({ isDefault: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      data: accounts,
      total: accounts.length
    });

  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank accounts' },
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

    const allowedRoles = ['super_admin', 'cha_quan_ly', 'ke_toan'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      accountCode,
      accountName,
      accountNumber,
      bankName,
      bankBranch,
      accountType,
      parishId,
      balance,
      isDefault,
      notes
    } = body;

    if (!accountCode || !accountName || !accountNumber || !bankName || !accountType) {
      return NextResponse.json(
        { error: 'Missing required fields: accountCode, accountName, accountNumber, bankName, accountType' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<BankAccount>('bank_accounts');

    // Check for duplicate account code or account number
    const existing = await collection.findOne({
      $or: [
        { accountCode },
        { accountNumber }
      ]
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Account code or account number already exists' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await collection.updateMany(
        { accountType: { $in: [accountType, 'both'] } },
        { $set: { isDefault: false } }
      );
    }

    const now = new Date();
    const newAccount: BankAccount = {
      accountCode,
      accountName,
      accountNumber,
      bankName,
      bankBranch: bankBranch || undefined,
      accountType,
      parishId: parishId ? new ObjectId(parishId) : undefined,
      balance: balance || 0,
      isDefault: isDefault || false,
      status: 'active',
      notes: notes || undefined,
      createdBy: new ObjectId(decoded.userId),
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newAccount);

    return NextResponse.json({
      data: { ...newAccount, _id: result.insertedId },
      message: 'Bank account created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating bank account:', error);
    return NextResponse.json(
      { error: 'Failed to create bank account' },
      { status: 500 }
    );
  }
}
