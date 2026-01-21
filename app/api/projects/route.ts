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

    const projectsCollection = await getCollection('projects');

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (parishId) query.parishId = parishId;

    const projects = await projectsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
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

    if (!body.projectName || !body.parishId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const projectsCollection = await getCollection('projects');

    const record = {
      projectName: body.projectName,
      parishId: body.parishId,
      parishName: body.parishName,
      projectType: body.projectType,
      description: body.description,
      budget: body.budget || 0,
      actualCost: body.actualCost || 0,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      expectedEnd: body.expectedEnd ? new Date(body.expectedEnd) : undefined,
      permitStatus: body.permitStatus,
      progress: body.progress || 0,
      status: body.status || 'in_progress',
      createdAt: new Date(),
    };

    const result = await projectsCollection.insertOne(record as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...record } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
