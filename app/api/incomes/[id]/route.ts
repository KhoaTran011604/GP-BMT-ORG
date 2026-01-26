import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Income, Receipt } from '@/lib/schemas';
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
    const collection = db.collection<Income>('incomes');

    const income = await collection.findOne({ _id: new ObjectId(id) });

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json({ data: income });

  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income' },
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

    const db = await getDatabase();
    const collection = db.collection<Income>('incomes');

    const income = await collection.findOne({ _id: new ObjectId(id) });

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    if (income.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only edit pending incomes' },
        { status: 403 }
      );
    }

    const isCreator = income.submittedBy.toString() === decoded.userId;
    const isSuperAdmin = decoded.role === 'super_admin';
    if (!isCreator && !isSuperAdmin) {
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

    const updateData: Partial<Income> = {
      updatedAt: new Date()
    };

    if (parishId) updateData.parishId = new ObjectId(parishId);
    if (fundId) updateData.fundId = new ObjectId(fundId);
    if (amount) updateData.amount = parseFloat(amount);
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (bankAccountId !== undefined) {
      updateData.bankAccountId = bankAccountId ? new ObjectId(bankAccountId) : undefined;
    }
    if (bankAccount !== undefined) updateData.bankAccount = bankAccount;
    if (payerName !== undefined) updateData.payerName = payerName;
    if (description !== undefined) updateData.description = description;
    if (incomeDate) {
      updateData.incomeDate = new Date(incomeDate);
      updateData.fiscalYear = new Date(incomeDate).getFullYear();
      updateData.fiscalPeriod = new Date(incomeDate).getMonth() + 1;
    }
    if (images !== undefined) updateData.images = images;
    if (notes !== undefined) updateData.notes = notes;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return NextResponse.json({
      data: result,
      message: 'Income updated successfully'
    });

  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json(
      { error: 'Failed to update income' },
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

    const db = await getDatabase();
    const collection = db.collection<Income>('incomes');

    const income = await collection.findOne({ _id: new ObjectId(id) });

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    if (income.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending incomes' },
        { status: 403 }
      );
    }

    const isCreator = income.submittedBy.toString() === decoded.userId;
    const isSuperAdmin = decoded.role === 'super_admin';
    if (!isCreator && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: 'Income deleted successfully' });

  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json(
      { error: 'Failed to delete income' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const { status, notes } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const incomesCollection = db.collection<Income>('incomes');
    const receiptsCollection = db.collection<Receipt>('receipts');

    const income = await incomesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    if (income.status !== 'pending') {
      return NextResponse.json(
        { error: 'Income already processed' },
        { status: 400 }
      );
    }

    const now = new Date();
    const updateData: Partial<Income> = {
      status: status as 'approved' | 'rejected',
      verifiedBy: new ObjectId(decoded.userId),
      verifiedAt: now,
      updatedAt: now
    };

    if (notes) {
      updateData.notes = notes;
    }

    const updatedIncome = await incomesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    let receipt: Receipt | null = null;

    if (status === 'approved') {
      const year = now.getFullYear();
      const count = await receiptsCollection.countDocuments({
        receiptNo: { $regex: `^REC-${year}-` }
      });
      const receiptNo = `REC-${year}-${String(count + 1).padStart(4, '0')}`;

      const newReceipt: Receipt = {
        receiptNo,
        receiptType: 'income',
        referenceId: new ObjectId(id),
        parishId: updatedIncome!.parishId,
        amount: updatedIncome!.amount,
        receiptDate: now,
        payerPayee: updatedIncome!.payerName || '',
        description: updatedIncome!.description,
        createdBy: new ObjectId(decoded.userId),
        createdAt: now
      };

      const receiptResult = await receiptsCollection.insertOne(newReceipt);
      receipt = { ...newReceipt, _id: receiptResult.insertedId };
    }

    return NextResponse.json({
      data: {
        income: updatedIncome,
        receipt: receipt
      },
      message: status === 'approved'
        ? 'Income approved and receipt generated'
        : 'Income rejected'
    });

  } catch (error) {
    console.error('Error approving/rejecting income:', error);
    return NextResponse.json(
      { error: 'Failed to process income' },
      { status: 500 }
    );
  }
}
