import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

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

    const subParishesCollection = await getCollection('subParishes');
    const subParish = await subParishesCollection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!subParish) {
      return NextResponse.json(
        { error: 'Sub-parish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: subParish });
  } catch (error) {
    console.error('Error fetching sub-parish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    if (!payload || !['super_admin', 'cha_quan_ly', 'cha_xu'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const subParishesCollection = await getCollection('subParishes');

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await subParishesCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return NextResponse.json(
        { error: 'Sub-parish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result.value });
  } catch (error) {
    console.error('Error updating sub-parish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    if (!payload || !['super_admin', 'cha_quan_ly'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const subParishesCollection = await getCollection('subParishes');

    const result = await subParishesCollection.deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Sub-parish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Sub-parish deleted successfully' });
  } catch (error) {
    console.error('Error deleting sub-parish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
