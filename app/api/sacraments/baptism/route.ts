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
    const parishId = searchParams.get('parishId');

    const baptismCollection = await getCollection('baptisms');

    const query: any = {};
    if (parishId) query.parishId = parishId;

    const records = await baptismCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const formattedRecords = records.map((r) => ({
      _id: r._id.toString(),
      baptismName: r.baptismName,
      fullName: r.fullName,
      dob: r.dob,
      baptismDate: r.baptismDate,
      baptismPlace: r.baptismPlace,
      minister: r.minister,
      godfather: r.godfather,
      godmother: r.godmother,
      fatherName: r.fatherName,
      motherName: r.motherName,
      registerBook: r.registerBook,
      registerNo: r.registerNo,
      parishId: r.parishId,
      parishName: r.parishName,
      notes: r.notes,
    }));

    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching baptism records:', error);
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

    if (!body.baptismName || !body.fullName || !body.baptismDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const baptismCollection = await getCollection('baptisms');

    const record = {
      baptismName: body.baptismName,
      fullName: body.fullName,
      dob: body.dob ? new Date(body.dob) : undefined,
      baptismDate: new Date(body.baptismDate),
      baptismPlace: body.baptismPlace,
      minister: body.minister,
      godfather: body.godfather,
      godmother: body.godmother,
      fatherName: body.fatherName,
      motherName: body.motherName,
      registerBook: body.registerBook,
      registerNo: body.registerNo,
      parishId: body.parishId,
      parishName: body.parishName,
      notes: body.notes,
      createdAt: new Date(),
    };

    const result = await baptismCollection.insertOne(record as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...record } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating baptism record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
