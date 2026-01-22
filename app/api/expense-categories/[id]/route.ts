import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { ExpenseCategory } from '@/lib/schemas';
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
    const collection = db.collection<ExpenseCategory>('expense_categories');

    const category = await collection.findOne({ _id: new ObjectId(id) });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ data: category });

  } catch (error) {
    console.error('Error fetching expense category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense category' },
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

    const db = await getDatabase();
    const collection = db.collection<ExpenseCategory>('expense_categories');

    const category = await collection.findOne({ _id: new ObjectId(id) });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const body = await request.json();
    const { categoryCode, categoryName, parentId, description, isActive } = body;

    // Check for duplicate code if code is being changed
    if (categoryCode && categoryCode !== category.categoryCode) {
      const existing = await collection.findOne({
        categoryCode,
        _id: { $ne: new ObjectId(id) }
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Category code already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: Partial<ExpenseCategory> = {
      updatedAt: new Date()
    };

    if (categoryCode) updateData.categoryCode = categoryCode;
    if (categoryName) updateData.categoryName = categoryName;
    if (parentId !== undefined) {
      updateData.parentId = parentId ? new ObjectId(parentId) : undefined;
    }
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return NextResponse.json({
      data: result,
      message: 'Expense category updated successfully'
    });

  } catch (error) {
    console.error('Error updating expense category:', error);
    return NextResponse.json(
      { error: 'Failed to update expense category' },
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
    const collection = db.collection<ExpenseCategory>('expense_categories');

    const category = await collection.findOne({ _id: new ObjectId(id) });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has children
    const hasChildren = await collection.findOne({ parentId: new ObjectId(id) });
    if (hasChildren) {
      return NextResponse.json(
        { error: 'Cannot delete category with child categories. Delete children first.' },
        { status: 400 }
      );
    }

    // Check if category is used in expenses
    const expensesCollection = db.collection('expenses');
    const usedInExpenses = await expensesCollection.findOne({ categoryId: new ObjectId(id) });
    if (usedInExpenses) {
      return NextResponse.json(
        { error: 'Cannot delete category that is used in expenses. Deactivate instead.' },
        { status: 400 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: 'Expense category deleted successfully' });

  } catch (error) {
    console.error('Error deleting expense category:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense category' },
      { status: 500 }
    );
  }
}
