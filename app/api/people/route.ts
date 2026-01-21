import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { Person } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET - List all people
export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');
    const limit = parseInt(searchParams.get('limit') || '100');

    const peopleCollection = await getCollection('people');

    const query: any = {};
    if (familyId) {
      query.familyId = new ObjectId(familyId);
    }

    const people = await peopleCollection
      .find(query)
      .sort({ fullName: 1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ data: people });
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new person
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
    if (!body.familyId || !body.fullName || !body.saintName || !body.gender || !body.dob || !body.relationship) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const peopleCollection = await getCollection('people');

    const person: Omit<Person, '_id'> = {
      familyId: new ObjectId(body.familyId),
      saintName: body.saintName,
      fullName: body.fullName,
      gender: body.gender,
      dob: new Date(body.dob),
      birthplace: body.birthplace,
      relationship: body.relationship,
      phone: body.phone,
      email: body.email,
      occupation: body.occupation,
      notes: body.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await peopleCollection.insertOne(person as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...person } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
