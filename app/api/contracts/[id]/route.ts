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
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    const contractsCollection = await getCollection('contracts');
    const contract = await contractsCollection.findOne({ _id: new ObjectId(id) });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: contract._id.toString(),
      contractNo: contract.contractNo,
      staffId: contract.staffId,
      staffName: contract.staffName,
      contractType: contract.contractType,
      startDate: contract.startDate,
      endDate: contract.endDate,
      basicSalary: contract.basicSalary,
      status: contract.status,
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
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
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    const body = await request.json();

    if (!body.basicSalary) {
      return NextResponse.json(
        { error: 'Missing required field: basicSalary' },
        { status: 400 }
      );
    }

    const contractsCollection = await getCollection('contracts');

    // Check if contract exists
    const existingContract = await contractsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingContract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const updateData: any = {
      contractType: body.contractType || existingContract.contractType,
      startDate: body.startDate ? new Date(body.startDate) : existingContract.startDate,
      endDate: body.endDate ? new Date(body.endDate) : (body.endDate === '' ? undefined : existingContract.endDate),
      basicSalary: parseFloat(body.basicSalary),
      status: body.status || existingContract.status,
      updatedAt: new Date(),
    };

    // Update contractNo if provided
    if (body.contractNo) {
      updateData.contractNo = body.contractNo;
    }

    // Update staffName if provided
    if (body.staffName) {
      updateData.staffName = body.staffName;
    }

    const result = await contractsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update contract' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { _id: id, ...updateData },
      message: 'Contract updated successfully'
    });
  } catch (error) {
    console.error('Error updating contract:', error);
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
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    const contractsCollection = await getCollection('contracts');

    const result = await contractsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
