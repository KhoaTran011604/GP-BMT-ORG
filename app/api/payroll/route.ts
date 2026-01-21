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
    const period = searchParams.get('period');
    const status = searchParams.get('status');

    const payrollCollection = await getCollection('payroll');

    const query: any = {};
    if (period) query.period = period;
    if (status && status !== 'all') query.status = status;

    const payrolls = await payrollCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const formattedPayrolls = payrolls.map((p) => ({
      _id: p._id.toString(),
      staffId: p.staffId,
      staffName: p.staffName,
      staffCode: p.staffCode,
      period: p.period,
      basicSalary: p.basicSalary || 0,
      responsibilityAllowance: p.responsibilityAllowance || 0,
      mealAllowance: p.mealAllowance || 0,
      transportAllowance: p.transportAllowance || 0,
      advance: p.advance || 0,
      deductions: p.deductions || 0,
      netSalary: p.netSalary || 0,
      status: p.status,
      approvedBy: p.approvedBy,
      paidAt: p.paidAt,
    }));

    return NextResponse.json(formattedPayrolls);
  } catch (error) {
    console.error('Error fetching payroll:', error);
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

    if (!body.staffId || !body.staffName || !body.period) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payrollCollection = await getCollection('payroll');

    // Check if payroll already exists for this staff and period
    const existing = await payrollCollection.findOne({
      staffId: body.staffId,
      period: body.period
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Payroll already exists for this period' },
        { status: 400 }
      );
    }

    const basicSalary = parseFloat(body.basicSalary) || 0;
    const responsibilityAllowance = parseFloat(body.responsibilityAllowance) || 0;
    const mealAllowance = parseFloat(body.mealAllowance) || 0;
    const transportAllowance = parseFloat(body.transportAllowance) || 0;
    const advance = parseFloat(body.advance) || 0;
    const deductions = parseFloat(body.deductions) || 0;

    const netSalary = basicSalary + responsibilityAllowance + mealAllowance + transportAllowance - advance - deductions;

    const payroll = {
      staffId: body.staffId,
      staffName: body.staffName,
      staffCode: body.staffCode,
      period: body.period,
      basicSalary,
      responsibilityAllowance,
      mealAllowance,
      transportAllowance,
      advance,
      deductions,
      netSalary,
      status: body.status || 'draft',
      createdAt: new Date(),
    };

    const result = await payrollCollection.insertOne(payroll as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...payroll } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payroll:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
