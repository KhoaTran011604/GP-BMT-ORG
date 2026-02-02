import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Adjustment } from '@/lib/schemas';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parishId = searchParams.get('parishId');
    const fundId = searchParams.get('fundId');
    const bankAccountId = searchParams.get('bankAccountId');
    const adjustmentType = searchParams.get('adjustmentType');
    const fiscalYear = searchParams.get('fiscalYear');
    const fiscalPeriod = searchParams.get('fiscalPeriod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const amountMin = searchParams.get('amountMin');
    const amountMax = searchParams.get('amountMax');
    const search = searchParams.get('search');
    const paymentMethod = searchParams.get('paymentMethod');

    const db = await getDatabase();
    const collection = db.collection<Adjustment>('adjustments');

    const filter: any = {};

    if (parishId) {
      filter.parishId = new ObjectId(parishId);
    }

    if (fundId) {
      filter.fundId = new ObjectId(fundId);
    }

    if (bankAccountId) {
      filter.bankAccountId = new ObjectId(bankAccountId);
    }

    if (adjustmentType && adjustmentType !== 'all') {
      filter.adjustmentType = adjustmentType;
    }

    if (fiscalYear) {
      filter.fiscalYear = parseInt(fiscalYear);
    }

    if (fiscalPeriod) {
      filter.fiscalPeriod = parseInt(fiscalPeriod);
    }

    if (startDate || endDate) {
      filter.adjustmentDate = {};
      if (startDate) {
        filter.adjustmentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.adjustmentDate.$lte = new Date(endDate);
      }
    }

    // Filter by amount range
    if (amountMin || amountMax) {
      filter.amount = {};
      if (amountMin) {
        filter.amount.$gte = parseFloat(amountMin);
      }
      if (amountMax) {
        filter.amount.$lte = parseFloat(amountMax);
      }
    }

    // Search by adjustmentCode or description
    if (search) {
      filter.$or = [
        { adjustmentCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by payment method based on bankAccountId
    // online = bankAccountId exists (not null), offline = bankAccountId is null
    if (paymentMethod === 'online') {
      filter.bankAccountId = { $ne: null };
    } else if (paymentMethod === 'offline') {
      filter.bankAccountId = null;
    }

    const adjustments = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      data: adjustments,
      total: adjustments.length
    });

  } catch (error) {
    console.error('Error fetching adjustments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch adjustments' },
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

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Cho phép các role: super_admin, cha_xu, thu_ky, ke_toan
    const allowedRoles = ['super_admin', 'cha_xu', 'thu_ky', 'ke_toan'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      parishId,
      fundId,
      bankAccountId,
      adjustmentType,
      amount,
      description,
      adjustmentDate,
      images,
      notes
    } = body;

    if (!parishId || !adjustmentType || !amount || !adjustmentDate || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate: phải có ít nhất fundId hoặc bankAccountId
    if (!fundId && !bankAccountId) {
      return NextResponse.json(
        { error: 'Must specify either fundId or bankAccountId' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<Adjustment>('adjustments');

    const year = new Date(adjustmentDate).getFullYear();
    const count = await collection.countDocuments({
      adjustmentCode: { $regex: `^ADJ-${year}-` }
    });
    const adjustmentCode = `ADJ-${year}-${String(count + 1).padStart(4, '0')}`;

    const now = new Date();
    const newAdjustment: Adjustment = {
      adjustmentCode,
      parishId: new ObjectId(parishId),
      fundId: fundId ? new ObjectId(fundId) : undefined,
      bankAccountId: bankAccountId ? new ObjectId(bankAccountId) : undefined,
      adjustmentType: adjustmentType as 'increase' | 'decrease',
      amount: Math.abs(parseFloat(amount)), // Luôn lưu số dương
      description,
      adjustmentDate: new Date(adjustmentDate),
      fiscalYear: year,
      fiscalPeriod: new Date(adjustmentDate).getMonth() + 1,
      images: images || [],
      notes,
      createdBy: new ObjectId(decoded.userId),
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newAdjustment);

    return NextResponse.json({
      data: { ...newAdjustment, _id: result.insertedId },
      message: 'Adjustment created successfully'
    });

  } catch (error) {
    console.error('Error creating adjustment:', error);
    return NextResponse.json(
      { error: 'Failed to create adjustment' },
      { status: 500 }
    );
  }
}
