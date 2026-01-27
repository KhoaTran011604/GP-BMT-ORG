import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }

    const staffCollection = await getCollection('staff');
    const staff = await staffCollection.findOne({ _id: new ObjectId(id) });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: staff._id.toString(),
      staffCode: staff.staffCode,
      fullName: staff.fullName,
      gender: staff.gender,
      dob: staff.dob,
      idNumber: staff.idNumber,
      phone: staff.phone,
      email: staff.email,
      address: staff.address,
      position: staff.position,
      department: staff.department,
      hireDate: staff.hireDate,
      contractType: staff.contractType,
      status: staff.status,
      bankName: staff.bankName,
      bankAccountNumber: staff.bankAccountNumber,
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }

    const body = await request.json();

    if (!body.staffCode || !body.fullName || !body.phone || !body.idNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const staffCollection = await getCollection('staff');

    // Check if staff exists
    const existingStaff = await staffCollection.findOne({ _id: new ObjectId(id) });
    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Check for duplicate staffCode (excluding current staff)
    const duplicateCode = await staffCollection.findOne({
      staffCode: body.staffCode,
      _id: { $ne: new ObjectId(id) }
    });
    if (duplicateCode) {
      return NextResponse.json(
        { error: 'Staff code already exists' },
        { status: 400 }
      );
    }

    const updateData = {
      staffCode: body.staffCode,
      fullName: body.fullName,
      gender: body.gender || 'male',
      dob: body.dob ? new Date(body.dob) : existingStaff.dob,
      idNumber: body.idNumber,
      phone: body.phone,
      email: body.email,
      address: body.address,
      position: body.position,
      department: body.department,
      hireDate: body.hireDate ? new Date(body.hireDate) : existingStaff.hireDate,
      contractType: body.contractType || existingStaff.contractType,
      status: body.status || existingStaff.status,
      bankName: body.bankName,
      bankAccountNumber: body.bankAccountNumber,
      updatedAt: new Date(),
    };

    const result = await staffCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update staff' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { _id: id, ...updateData },
      message: 'Staff updated successfully'
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }

    const staffCollection = await getCollection('staff');
    const contractsCollection = await getCollection('contracts');

    // Check if staff has active contracts
    const activeContract = await contractsCollection.findOne({
      staffId: id,
      status: 'active'
    });
    if (activeContract) {
      return NextResponse.json(
        { error: 'Cannot delete staff with active contract' },
        { status: 400 }
      );
    }

    const result = await staffCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
