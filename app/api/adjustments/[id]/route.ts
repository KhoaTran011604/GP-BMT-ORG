import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Adjustment } from '@/lib/schemas';
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
    const collection = db.collection<Adjustment>('adjustments');

    const adjustment = await collection.findOne({ _id: new ObjectId(id) });

    if (!adjustment) {
      return NextResponse.json({ error: 'Adjustment not found' }, { status: 404 });
    }

    return NextResponse.json({ data: adjustment });

  } catch (error) {
    console.error('Error fetching adjustment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch adjustment' },
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
    const collection = db.collection<Adjustment>('adjustments');

    const adjustment = await collection.findOne({ _id: new ObjectId(id) });

    if (!adjustment) {
      return NextResponse.json({ error: 'Adjustment not found' }, { status: 404 });
    }

    // Chỉ người tạo hoặc super_admin mới được sửa
    const isCreator = adjustment.createdBy.toString() === decoded.userId;
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
      bankAccountId,
      adjustmentType,
      amount,
      description,
      adjustmentDate,
      images,
      notes
    } = body;

    const updateData: Partial<Adjustment> = {
      updatedAt: new Date()
    };

    if (parishId) updateData.parishId = new ObjectId(parishId);
    if (fundId !== undefined) {
      updateData.fundId = fundId ? new ObjectId(fundId) : undefined;
    }
    if (bankAccountId !== undefined) {
      updateData.bankAccountId = bankAccountId ? new ObjectId(bankAccountId) : undefined;
    }
    if (adjustmentType) updateData.adjustmentType = adjustmentType as 'increase' | 'decrease';
    if (amount) updateData.amount = Math.abs(parseFloat(amount));
    if (description !== undefined) updateData.description = description;
    if (adjustmentDate) {
      updateData.adjustmentDate = new Date(adjustmentDate);
      updateData.fiscalYear = new Date(adjustmentDate).getFullYear();
      updateData.fiscalPeriod = new Date(adjustmentDate).getMonth() + 1;
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
      message: 'Adjustment updated successfully'
    });

  } catch (error) {
    console.error('Error updating adjustment:', error);
    return NextResponse.json(
      { error: 'Failed to update adjustment' },
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
    const collection = db.collection<Adjustment>('adjustments');

    const adjustment = await collection.findOne({ _id: new ObjectId(id) });

    if (!adjustment) {
      return NextResponse.json({ error: 'Adjustment not found' }, { status: 404 });
    }

    // Chỉ người tạo hoặc super_admin mới được xóa
    const isCreator = adjustment.createdBy.toString() === decoded.userId;
    const isSuperAdmin = decoded.role === 'super_admin';
    if (!isCreator && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: 'Adjustment deleted successfully' });

  } catch (error) {
    console.error('Error deleting adjustment:', error);
    return NextResponse.json(
      { error: 'Failed to delete adjustment' },
      { status: 500 }
    );
  }
}
