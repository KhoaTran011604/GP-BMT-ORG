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
    const parishId = searchParams.get('parishId');
    const limit = parseInt(searchParams.get('limit') || '100');

    const peopleCollection = await getCollection('parishioners');
    const parishesCollection = await getCollection('parishes');

    const query: any = {};
    if (parishId) {
      query.parishId = new ObjectId(parishId);
    }

    const people = await peopleCollection
      .find(query)
      .sort({ fullName: 1 })
      .limit(limit)
      .toArray();

    // Get parish names for each person
    const parishIds = [...new Set(people.map(p => p.parishId?.toString()).filter(Boolean))];
    const parishes = await parishesCollection
      .find({ _id: { $in: parishIds.map(id => new ObjectId(id)) } })
      .toArray();

    const parishMap = new Map(parishes.map(p => [p._id.toString(), p.parishName]));

    const peopleWithParish = people.map(person => ({
      ...person,
      parishName: person.parishId ? parishMap.get(person.parishId.toString()) : undefined,
    }));

    return NextResponse.json({ data: peopleWithParish });
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
    if (!body.parishId || !body.fullName || !body.saintName || !body.gender || !body.dob || !body.relationship) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const peopleCollection = await getCollection('parishioners');

    const person: Omit<Person, '_id'> = {
      parishId: new ObjectId(body.parishId),
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
      status: body.status || 'active',
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

// PUT - Update person
export async function PUT(request: NextRequest) {
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
    if (!body._id) {
      return NextResponse.json(
        { error: 'Person ID is required' },
        { status: 400 }
      );
    }

    if (!body.parishId || !body.fullName || !body.saintName || !body.gender || !body.dob || !body.relationship) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const peopleCollection = await getCollection('parishioners');

    const updateData: any = {
      parishId: new ObjectId(body.parishId),
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
      status: body.status || 'active',
      updatedAt: new Date(),
    };

    const result = await peopleCollection.updateOne(
      { _id: new ObjectId(body._id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: { _id: body._id, ...updateData } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating person:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete person
export async function DELETE(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('id');

    if (!personId) {
      return NextResponse.json(
        { error: 'Person ID is required' },
        { status: 400 }
      );
    }

    const peopleCollection = await getCollection('parishioners');

    const result = await peopleCollection.deleteOne({
      _id: new ObjectId(personId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Person deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting person:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
