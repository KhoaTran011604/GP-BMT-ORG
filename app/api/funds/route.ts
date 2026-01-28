import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const fundsCollection = await getCollection('funds');

    const query = category ? { category } : {};

    const funds = await fundsCollection
      .find(query)
      .sort({ fundCode: 1 })
      .toArray();

    return NextResponse.json({ data: funds });
  } catch (error) {
    console.error('Error fetching funds:', error);
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

    await verifyToken(token);

    const body = await request.json();
    const { fundCode, fundName, category, fiscalPeriod, recipientUnit } = body;

    if (!fundCode || !fundName || !category) {
      return NextResponse.json(
        { error: 'Mã quỹ, tên quỹ và nhóm quỹ là bắt buộc' },
        { status: 400 }
      );
    }

    const fundsCollection = await getCollection('funds');

    // Check for duplicate fundCode
    const existing = await fundsCollection.findOne({ fundCode });
    if (existing) {
      return NextResponse.json(
        { error: 'Mã quỹ đã tồn tại' },
        { status: 400 }
      );
    }

    const now = new Date();
    const fund = {
      fundCode,
      fundName,
      category,
      fiscalPeriod: fiscalPeriod || 'yearly',
      recipientUnit: recipientUnit || '',
      createdAt: now,
      updatedAt: now,
    };

    const result = await fundsCollection.insertOne(fund);

    return NextResponse.json({
      message: 'Tạo quỹ thành công',
      data: { ...fund, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating fund:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
