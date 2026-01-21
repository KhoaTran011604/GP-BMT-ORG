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

    const marriageCollection = await getCollection('marriages');

    const records = await marriageCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedRecords = records.map((r) => ({
      _id: r._id.toString(),
      groomName: r.groomName,
      groomParish: r.groomParish,
      brideName: r.brideName,
      brideParish: r.brideParish,
      marriageDate: r.marriageDate,
      marriagePlace: r.marriagePlace,
      minister: r.minister,
      witness1: r.witness1,
      witness2: r.witness2,
      dispensation: r.dispensation,
      registerBook: r.registerBook,
      registerNo: r.registerNo,
    }));

    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching marriage records:', error);
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

    if (!body.groomName || !body.brideName || !body.marriageDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const marriageCollection = await getCollection('marriages');

    const record = {
      groomName: body.groomName,
      groomParish: body.groomParish,
      brideName: body.brideName,
      brideParish: body.brideParish,
      marriageDate: new Date(body.marriageDate),
      marriagePlace: body.marriagePlace,
      minister: body.minister,
      witness1: body.witness1,
      witness2: body.witness2,
      dispensation: body.dispensation,
      registerBook: body.registerBook,
      registerNo: body.registerNo,
      createdAt: new Date(),
    };

    const result = await marriageCollection.insertOne(record as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...record } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating marriage record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
