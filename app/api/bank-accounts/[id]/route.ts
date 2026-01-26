import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { BankAccount } from '@/lib/schemas';
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
    const collection = db.collection<BankAccount>('bank_accounts');

    const account = await collection.findOne({ _id: new ObjectId(id) });

    if (!account) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: account });

  } catch (error) {
    console.error('Error fetching bank account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank account' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const allowedRoles = ['super_admin', 'cha_quan_ly', 'ke_toan'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const db = await getDatabase();
    const collection = db.collection<BankAccount>('bank_accounts');

    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    // Check for duplicate account number (excluding current account)
    if (body.accountNumber && body.accountNumber !== existing.accountNumber) {
      const duplicate = await collection.findOne({
        accountNumber: body.accountNumber,
        _id: { $ne: new ObjectId(id) }
      });
      if (duplicate) {
        return NextResponse.json(
          { error: 'Account number already exists' },
          { status: 400 }
        );
      }
    }

    // If setting as default, unset other defaults
    if (body.isDefault && !existing.isDefault) {
      const accountType = body.accountType || existing.accountType;
      await collection.updateMany(
        { accountType: { $in: [accountType, 'both'] }, _id: { $ne: new ObjectId(id) } },
        { $set: { isDefault: false } }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    // Only update provided fields
    const allowedFields = [
      'accountName', 'accountNumber', 'bankName', 'bankBranch',
      'accountType', 'parishId', 'balance', 'isDefault', 'status', 'notes'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'parishId' && body[field]) {
          updateData[field] = new ObjectId(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updated = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      data: updated,
      message: 'Bank account updated successfully'
    });

  } catch (error) {
    console.error('Error updating bank account:', error);
    return NextResponse.json(
      { error: 'Failed to update bank account' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const allowedRoles = ['super_admin', 'cha_quan_ly'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<BankAccount>('bank_accounts');

    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      );
    }

    // Instead of hard delete, soft delete by setting status to inactive
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'inactive',
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      message: 'Bank account deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting bank account:', error);
    return NextResponse.json(
      { error: 'Failed to delete bank account' },
      { status: 500 }
    );
  }
}
