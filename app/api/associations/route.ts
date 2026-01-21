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
    const parishId = searchParams.get('parishId');

    const associationsCollection = await getCollection('associations');

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (parishId) query.parishId = parishId;

    const associations = await associationsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(associations);
  } catch (error) {
    console.error('Error fetching associations:', error);
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

    if (!body.name || !body.parishId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const associationsCollection = await getCollection('associations');

    const record = {
      name: body.name,
      parishId: body.parishId,
      parishName: body.parishName,
      patronSaint: body.patronSaint,
      establishedDate: body.establishedDate ? new Date(body.establishedDate) : undefined,
      leaderName: body.leaderName,
      memberCount: body.memberCount || 0,
      budget: body.budget || 0,
      status: body.status || 'active',
      createdAt: new Date(),
    };

    const result = await associationsCollection.insertOne(record as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...record } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating association:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
