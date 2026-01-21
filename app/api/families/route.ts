import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { Family } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET - List all families
export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const parishId = searchParams.get('parishId');

    const familiesCollection = await getCollection('families');
    const parishesCollection = await getCollection('parishes');

    const query: any = {};
    if (parishId) {
      query.parishId = new ObjectId(parishId);
    }

    const families = await familiesCollection
      .find(query)
      .sort({ familyCode: 1 })
      .toArray();

    // Get parish names for each family
    const parishIds = [...new Set(families.map(f => f.parishId?.toString()).filter(Boolean))];
    const parishes = await parishesCollection
      .find({ _id: { $in: parishIds.map(id => new ObjectId(id)) } })
      .toArray();

    const parishMap = new Map(parishes.map(p => [p._id.toString(), p.parishName]));

    const familiesWithParish = families.map(family => ({
      ...family,
      parishName: family.parishId ? parishMap.get(family.parishId.toString()) : undefined,
    }));

    return NextResponse.json({ data: familiesWithParish });
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new family
export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validation
    if (!body.familyCode || !body.familyName || !body.parishId || !body.address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const familiesCollection = await getCollection('families');

    // Check if family code exists
    const existing = await familiesCollection.findOne({ familyCode: body.familyCode });
    if (existing) {
      return NextResponse.json(
        { error: 'Family code already exists' },
        { status: 409 }
      );
    }

    const family: Omit<Family, '_id'> = {
      familyCode: body.familyCode,
      familyName: body.familyName,
      parishId: new ObjectId(body.parishId),
      subParishId: body.subParishId ? new ObjectId(body.subParishId) : undefined,
      address: body.address,
      phone: body.phone,
      registrationDate: body.registrationDate ? new Date(body.registrationDate) : new Date(),
      status: body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await familiesCollection.insertOne(family as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...family } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
