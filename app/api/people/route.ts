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

    const peopleCollection = await getCollection('parishioners');
    const familiesCollection = await getCollection('families');

    const query: any = {};
    if (familyId) {
      query.familyId = new ObjectId(familyId);
    }

    const people = await peopleCollection
      .find(query)
      .sort({ fullName: 1 })
      .limit(limit)
      .toArray();

    // Get family names for each person
    const familyIds = [...new Set(people.map(p => p.familyId?.toString()).filter(Boolean))];
    const families = await familiesCollection
      .find({ _id: { $in: familyIds.map(id => new ObjectId(id)) } })
      .toArray();

    const familyMap = new Map(families.map(f => [f._id.toString(), f.familyName]));

    const peopleWithFamily = people.map(person => ({
      ...person,
      familyName: person.familyId ? familyMap.get(person.familyId.toString()) : undefined,
    }));

    return NextResponse.json({ data: peopleWithFamily });
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

    const peopleCollection = await getCollection('parishioners');

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

    if (!body.familyId || !body.fullName || !body.saintName || !body.gender || !body.dob || !body.relationship) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const peopleCollection = await getCollection('parishioners');

    const updateData: any = {
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
