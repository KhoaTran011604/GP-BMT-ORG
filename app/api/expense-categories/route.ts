import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { ExpenseCategory } from '@/lib/schemas';
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
    const isActive = searchParams.get('isActive');
    const parentId = searchParams.get('parentId');

    const db = await getDatabase();
    const collection = db.collection<ExpenseCategory>('expense_categories');

    const filter: any = {};

    if (isActive === 'true') {
      filter.isActive = true;
    } else if (isActive === 'false') {
      filter.isActive = false;
    }

    if (parentId === 'null') {
      filter.parentId = { $exists: false };
    } else if (parentId) {
      filter.parentId = new ObjectId(parentId);
    }

    const categories = await collection
      .find(filter)
      .sort({ categoryCode: 1 })
      .toArray();

    return NextResponse.json({
      data: categories,
      total: categories.length
    });

  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense categories' },
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
    const { categoryCode, categoryName, parentId, description } = body;

    if (!categoryCode || !categoryName) {
      return NextResponse.json(
        { error: 'Category code and name are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<ExpenseCategory>('expense_categories');

    // Check for duplicate code
    const existing = await collection.findOne({ categoryCode });
    if (existing) {
      return NextResponse.json(
        { error: 'Category code already exists' },
        { status: 400 }
      );
    }

    const now = new Date();
    const newCategory: ExpenseCategory = {
      categoryCode,
      categoryName,
      parentId: parentId ? new ObjectId(parentId) : undefined,
      description,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newCategory);

    return NextResponse.json({
      data: { ...newCategory, _id: result.insertedId },
      message: 'Expense category created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating expense category:', error);
    return NextResponse.json(
      { error: 'Failed to create expense category' },
      { status: 500 }
    );
  }
}
