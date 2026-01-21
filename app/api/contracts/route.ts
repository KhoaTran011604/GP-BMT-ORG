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

    const contractsCollection = await getCollection('contracts');

    const query: any = {};
    if (status && status !== 'all') query.status = status;

    const contracts = await contractsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const formattedContracts = contracts.map((c) => ({
      _id: c._id.toString(),
      contractNo: c.contractNo,
      staffId: c.staffId,
      staffName: c.staffName,
      contractType: c.contractType,
      startDate: c.startDate,
      endDate: c.endDate,
      basicSalary: c.basicSalary,
      status: c.status,
    }));

    return NextResponse.json(formattedContracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
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

    if (!body.staffId || !body.staffName || !body.basicSalary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const contractsCollection = await getCollection('contracts');

    // Generate contract number: HD-YYYY-XXX
    const year = new Date().getFullYear();
    const count = await contractsCollection.countDocuments({
      contractNo: { $regex: `^HD-${year}-` }
    });
    const contractNo = `HD-${year}-${String(count + 1).padStart(3, '0')}`;

    const contract = {
      contractNo,
      staffId: body.staffId,
      staffName: body.staffName,
      contractType: body.contractType || 'full_time',
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      basicSalary: parseFloat(body.basicSalary),
      status: body.status || 'active',
      createdAt: new Date(),
    };

    const result = await contractsCollection.insertOne(contract as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...contract } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
