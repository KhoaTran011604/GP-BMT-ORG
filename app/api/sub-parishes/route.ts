import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { SubParish } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const parishId = searchParams.get('parishId');

    const subParishesCollection = await getCollection('subParishes');
    const query = parishId ? { parishId: new ObjectId(parishId) } : {};

    const subParishes = await subParishesCollection
      .find(query)
      .sort({ subParishCode: 1 })
      .toArray();

    return NextResponse.json(subParishes);
  } catch (error) {
    console.error('Error fetching sub-parishes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const payload = await verifyToken(token);
    if (!payload || !['super_admin', 'cha_quan_ly', 'cha_xu'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.subParishCode || !body.subParishName || !body.parishId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const subParishesCollection = await getCollection('subParishes');

    const existing = await subParishesCollection.findOne({
      subParishCode: body.subParishCode,
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Sub-parish code already exists' },
        { status: 409 }
      );
    }

    const subParish: Omit<SubParish, '_id'> = {
      subParishCode: body.subParishCode,
      subParishName: body.subParishName,
      parishId: new ObjectId(body.parishId),
      patronSaint: body.patronSaint,
      address: body.address,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await subParishesCollection.insertOne(subParish as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...subParish } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sub-parish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
