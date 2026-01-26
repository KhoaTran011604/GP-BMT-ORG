import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Expense, Receipt } from '@/lib/schemas';
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
    const collection = db.collection<Expense>('expenses');

    const expense = await collection.findOne({ _id: new ObjectId(id) });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ data: expense });

  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
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
    const collection = db.collection<Expense>('expenses');

    const expense = await collection.findOne({ _id: new ObjectId(id) });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only edit pending expenses' },
        { status: 403 }
      );
    }

    const isCreator = expense.requestedBy.toString() === decoded.userId;
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
      categoryId,
      fundId,
      amount,
      paymentMethod,
      bankAccountId,
      bankAccount,
      payeeName,
      description,
      expenseDate,
      images,
      notes
    } = body;

    const updateData: Partial<Expense> = {
      updatedAt: new Date()
    };

    if (parishId) updateData.parishId = new ObjectId(parishId);
    if (categoryId !== undefined) {
      updateData.categoryId = categoryId ? new ObjectId(categoryId) : undefined;
    }
    if (fundId !== undefined) {
      updateData.fundId = fundId ? new ObjectId(fundId) : undefined;
    }
    if (amount) updateData.amount = parseFloat(amount);
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (bankAccountId !== undefined) {
      updateData.bankAccountId = bankAccountId ? new ObjectId(bankAccountId) : undefined;
    }
    if (bankAccount !== undefined) updateData.bankAccount = bankAccount;
    if (payeeName !== undefined) updateData.payeeName = payeeName;
    if (description !== undefined) updateData.description = description;
    if (expenseDate) {
      updateData.expenseDate = new Date(expenseDate);
      updateData.fiscalYear = new Date(expenseDate).getFullYear();
      updateData.fiscalPeriod = new Date(expenseDate).getMonth() + 1;
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
      message: 'Expense updated successfully'
    });

  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
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
    const collection = db.collection<Expense>('expenses');

    const expense = await collection.findOne({ _id: new ObjectId(id) });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending expenses' },
        { status: 403 }
      );
    }

    const isCreator = expense.requestedBy.toString() === decoded.userId;
    const isSuperAdmin = decoded.role === 'super_admin';
    if (!isCreator && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: 'Expense deleted successfully' });

  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
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
    const expensesCollection = db.collection<Expense>('expenses');
    const receiptsCollection = db.collection<Receipt>('receipts');

    const expense = await expensesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.status !== 'pending') {
      return NextResponse.json(
        { error: 'Expense already processed' },
        { status: 400 }
      );
    }

    const now = new Date();
    const updateData: Partial<Expense> = {
      status: status as 'approved' | 'rejected',
      approvedBy: new ObjectId(decoded.userId),
      approvedAt: now,
      updatedAt: now
    };

    if (notes) {
      updateData.notes = notes;
    }

    const updatedExpense = await expensesCollection.findOneAndUpdate(
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
        receiptType: 'expense',
        referenceId: new ObjectId(id),
        parishId: updatedExpense!.parishId,
        amount: updatedExpense!.amount,
        receiptDate: now,
        payerPayee: updatedExpense!.payeeName || '',
        description: updatedExpense!.description,
        createdBy: new ObjectId(decoded.userId),
        createdAt: now
      };

      const receiptResult = await receiptsCollection.insertOne(newReceipt);
      receipt = { ...newReceipt, _id: receiptResult.insertedId };
    }

    return NextResponse.json({
      data: {
        expense: updatedExpense,
        receipt: receipt
      },
      message: status === 'approved'
        ? 'Expense approved and receipt generated'
        : 'Expense rejected'
    });

  } catch (error) {
    console.error('Error approving/rejecting expense:', error);
    return NextResponse.json(
      { error: 'Failed to process expense' },
      { status: 500 }
    );
  }
}
