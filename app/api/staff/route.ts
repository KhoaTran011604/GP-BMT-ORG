import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { Staff } from '@/lib/schemas';
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
    const department = searchParams.get('department');

    const staffCollection = await getCollection('staff');

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (department) query.department = department;

    const staffList = await staffCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const formattedStaff = staffList.map((s) => ({
      _id: s._id.toString(),
      staffCode: s.staffCode,
      fullName: s.fullName,
      gender: s.gender,
      dob: s.dob,
      idNumber: s.idNumber,
      phone: s.phone,
      email: s.email,
      address: s.address,
      position: s.position,
      department: s.department,
      hireDate: s.hireDate,
      contractType: s.contractType,
      status: s.status,
    }));

    return NextResponse.json(formattedStaff);
  } catch (error) {
    console.error('Error fetching staff:', error);
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

    if (!body.staffCode || !body.fullName || !body.phone || !body.idNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const staffCollection = await getCollection('staff');

    // Check duplicate staffCode
    const existing = await staffCollection.findOne({ staffCode: body.staffCode });
    if (existing) {
      return NextResponse.json(
        { error: 'Staff code already exists' },
        { status: 400 }
      );
    }

    const staff: Omit<Staff, '_id'> = {
      staffCode: body.staffCode,
      fullName: body.fullName,
      gender: body.gender || 'male',
      dob: body.dob ? new Date(body.dob) : new Date(),
      idNumber: body.idNumber,
      phone: body.phone,
      email: body.email,
      address: body.address,
      position: body.position,
      department: body.department,
      hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
      contractType: body.contractType || 'full_time',
      status: body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await staffCollection.insertOne(staff as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...staff } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
