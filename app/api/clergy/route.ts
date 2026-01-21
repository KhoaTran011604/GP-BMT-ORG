import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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
    const status = searchParams.get('status');

    const clergyCollection = await getCollection('clergy');

    const query: any = {};
    if (status && status !== 'all') query.status = status;

    const clergyList = await clergyCollection
      .find(query)
      .sort({ fullName: 1 })
      .toArray();

    const formattedClergy = clergyList.map((c) => ({
      _id: c._id.toString(),
      saintName: c.saintName,
      fullName: c.fullName,
      dob: c.dob,
      birthplace: c.birthplace,
      ordinationDate: c.ordinationDate,
      trainingClass: c.trainingClass,
      currentAssignment: c.currentAssignment,
      parishId: c.parishId,
      parishName: c.parishName,
      phone: c.phone,
      email: c.email,
      photoUrl: c.photoUrl,
      status: c.status,
    }));

    return NextResponse.json(formattedClergy);
  } catch (error) {
    console.error('Error fetching clergy:', error);
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
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.saintName || !body.fullName || !body.ordinationDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const clergyCollection = await getCollection('clergy');

    const clergy = {
      saintName: body.saintName,
      fullName: body.fullName,
      dob: body.dob ? new Date(body.dob) : undefined,
      birthplace: body.birthplace,
      ordinationDate: body.ordinationDate ? new Date(body.ordinationDate) : new Date(),
      trainingClass: body.trainingClass,
      currentAssignment: body.currentAssignment,
      parishId: body.parishId,
      parishName: body.parishName,
      phone: body.phone,
      email: body.email,
      photoUrl: body.photoUrl,
      status: body.status || 'active',
      createdAt: new Date(),
    };

    const result = await clergyCollection.insertOne(clergy as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...clergy } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating clergy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
