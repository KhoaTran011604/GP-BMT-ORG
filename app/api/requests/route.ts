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
    const requestType = searchParams.get('requestType');

    const requestsCollection = await getCollection('requests');

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (requestType) query.requestType = requestType;

    const requests = await requestsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
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

    if (!body.requestType || !body.parishId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const requestsCollection = await getCollection('requests');

    const record = {
      requestId: body.requestId,
      requestType: body.requestType,
      parishId: body.parishId,
      parishName: body.parishName,
      submittedBy: body.submittedBy,
      submitterName: body.submitterName,
      status: body.status || 'pending',
      workflowStep: body.workflowStep || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await requestsCollection.insertOne(record as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...record } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
