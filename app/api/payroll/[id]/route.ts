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
      return NextResponse.json({ error: 'Invalid payroll ID' }, { status: 400 });
    }

    const payrollCollection = await getCollection('payroll');
    const payroll = await payrollCollection.findOne({ _id: new ObjectId(id) });

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: payroll._id.toString(),
      staffId: payroll.staffId,
      staffName: payroll.staffName,
      staffCode: payroll.staffCode,
      period: payroll.period,
      basicSalary: payroll.basicSalary || 0,
      responsibilityAllowance: payroll.responsibilityAllowance || 0,
      mealAllowance: payroll.mealAllowance || 0,
      transportAllowance: payroll.transportAllowance || 0,
      advance: payroll.advance || 0,
      deductions: payroll.deductions || 0,
      netSalary: payroll.netSalary || 0,
      status: payroll.status,
      approvedBy: payroll.approvedBy,
      paidAt: payroll.paidAt,
    });
  } catch (error) {
    console.error('Error fetching payroll:', error);
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
      return NextResponse.json({ error: 'Invalid payroll ID' }, { status: 400 });
    }

    const body = await request.json();

    const payrollCollection = await getCollection('payroll');

    // Check if payroll exists
    const existingPayroll = await payrollCollection.findOne({ _id: new ObjectId(id) });
    if (!existingPayroll) {
      return NextResponse.json({ error: 'Payroll not found' }, { status: 404 });
    }

    // Only allow editing draft payrolls
    if (existingPayroll.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot edit payroll that is not in draft status' },
        { status: 400 }
      );
    }

    const basicSalary = parseFloat(body.basicSalary) || existingPayroll.basicSalary || 0;
    const responsibilityAllowance = parseFloat(body.responsibilityAllowance) || 0;
    const mealAllowance = parseFloat(body.mealAllowance) || 0;
    const transportAllowance = parseFloat(body.transportAllowance) || 0;
    const advance = parseFloat(body.advance) || 0;
    const deductions = parseFloat(body.deductions) || 0;

    // Calculate net salary
    const netSalary = basicSalary + responsibilityAllowance + mealAllowance + transportAllowance - advance - deductions;

    const updateData = {
      basicSalary,
      responsibilityAllowance,
      mealAllowance,
      transportAllowance,
      advance,
      deductions,
      netSalary,
      updatedAt: new Date(),
    };

    const result = await payrollCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update payroll' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { _id: id, ...updateData },
      message: 'Payroll updated successfully'
    });
  } catch (error) {
    console.error('Error updating payroll:', error);
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
      return NextResponse.json({ error: 'Invalid payroll ID' }, { status: 400 });
    }

    const payrollCollection = await getCollection('payroll');

    // Check if payroll exists and is in draft status
    const existingPayroll = await payrollCollection.findOne({ _id: new ObjectId(id) });
    if (!existingPayroll) {
      return NextResponse.json({ error: 'Payroll not found' }, { status: 404 });
    }

    if (existingPayroll.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot delete payroll that is not in draft status' },
        { status: 400 }
      );
    }

    const result = await payrollCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Payroll not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Payroll deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
