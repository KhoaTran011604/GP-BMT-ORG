import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { Parish } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET - List all parishes
export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);

    const parishesCollection = await getCollection('parishes');
    const parishes = await parishesCollection
      .find({})
      .sort({ parishCode: 1 })
      .toArray();

    return NextResponse.json({ data: parishes });
  } catch (error) {
    console.error('Error fetching parishes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new parish
export async function POST(request: NextRequest) {
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

    // Validation
    if (!body.parishCode || !body.parishName || !body.patronSaint || !body.address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const parishesCollection = await getCollection('parishes');

    // Check if parish code exists
    const existing = await parishesCollection.findOne({ parishCode: body.parishCode });
    if (existing) {
      return NextResponse.json(
        { error: 'Parish code already exists' },
        { status: 409 }
      );
    }

    const parish: Omit<Parish, '_id'> = {
      parishCode: body.parishCode,
      parishName: body.parishName,
      patronSaint: body.patronSaint,
      feastDay: body.feastDay || '',
      establishedDate: body.establishedDate ? new Date(body.establishedDate) : undefined,
      address: body.address,
      phone: body.phone,
      email: body.email,
      pastorId: body.pastorId ? new ObjectId(body.pastorId) : undefined,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await parishesCollection.insertOne(parish as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...parish } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating parish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
