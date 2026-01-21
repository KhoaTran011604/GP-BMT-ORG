import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { Parish } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET - Get parish by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);

    const parishesCollection = await getCollection('parishes');
    const parish = await parishesCollection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!parish) {
      return NextResponse.json({ error: 'Parish not found' }, { status: 404 });
    }

    return NextResponse.json({ data: parish });
  } catch (error) {
    console.error('Error fetching parish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update parish
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !['super_admin', 'cha_quan_ly'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const parishesCollection = await getCollection('parishes');

    const updateData: Partial<Parish> = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.pastorId) {
      updateData.pastorId = new ObjectId(body.pastorId);
    }

    if (body.establishedDate) {
      updateData.establishedDate = new Date(body.establishedDate);
    }

    const result = await parishesCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return NextResponse.json({ error: 'Parish not found' }, { status: 404 });
    }

    return NextResponse.json({ data: result.value });
  } catch (error) {
    console.error('Error updating parish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete parish
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parishesCollection = await getCollection('parishes');

    const result = await parishesCollection.deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Parish not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Parish deleted successfully' });
  } catch (error) {
    console.error('Error deleting parish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
