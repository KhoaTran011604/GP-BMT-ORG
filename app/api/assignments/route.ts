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
    const role = searchParams.get('role');
    const isCurrent = searchParams.get('isCurrent');

    const assignmentsCollection = await getCollection('assignments');

    const query: any = {};
    if (role && role !== 'all') query.role = role;
    if (isCurrent === 'true') query.isCurrent = true;

    const assignments = await assignmentsCollection
      .find(query)
      .sort({ startDate: -1 })
      .toArray();

    const formattedAssignments = assignments.map((a) => ({
      _id: a._id.toString(),
      clergyId: a.clergyId,
      clergyName: a.clergyName,
      parishId: a.parishId,
      parishName: a.parishName,
      role: a.role,
      startDate: a.startDate,
      endDate: a.endDate,
      decreeNo: a.decreeNo,
      notes: a.notes,
      isCurrent: a.isCurrent,
    }));

    return NextResponse.json(formattedAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
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

    if (!body.clergyId || !body.parishId || !body.role || !body.startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assignmentsCollection = await getCollection('assignments');

    const assignment = {
      clergyId: body.clergyId,
      clergyName: body.clergyName,
      parishId: body.parishId,
      parishName: body.parishName,
      role: body.role,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      decreeNo: body.decreeNo,
      notes: body.notes,
      isCurrent: body.isCurrent !== false,
      createdAt: new Date(),
    };

    const result = await assignmentsCollection.insertOne(assignment as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...assignment } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
