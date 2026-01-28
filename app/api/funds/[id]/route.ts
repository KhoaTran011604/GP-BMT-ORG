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

    await verifyToken(token);

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid fund ID' }, { status: 400 });
    }

    const fundsCollection = await getCollection('funds');
    const fund = await fundsCollection.findOne({ _id: new ObjectId(id) });

    if (!fund) {
      return NextResponse.json({ error: 'Không tìm thấy quỹ' }, { status: 404 });
    }

    return NextResponse.json({ data: fund });
  } catch (error) {
    console.error('Error fetching fund:', error);
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

    await verifyToken(token);

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid fund ID' }, { status: 400 });
    }

    const body = await request.json();
    const { fundCode, fundName, category, fiscalPeriod, recipientUnit } = body;

    if (!fundCode || !fundName || !category) {
      return NextResponse.json(
        { error: 'Mã quỹ, tên quỹ và nhóm quỹ là bắt buộc' },
        { status: 400 }
      );
    }

    const fundsCollection = await getCollection('funds');

    // Check for duplicate fundCode (excluding current fund)
    const existing = await fundsCollection.findOne({
      fundCode,
      _id: { $ne: new ObjectId(id) }
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Mã quỹ đã tồn tại' },
        { status: 400 }
      );
    }

    const result = await fundsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          fundCode,
          fundName,
          category,
          fiscalPeriod: fiscalPeriod || 'yearly',
          recipientUnit: recipientUnit || '',
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Không tìm thấy quỹ' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cập nhật quỹ thành công' });
  } catch (error) {
    console.error('Error updating fund:', error);
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

    await verifyToken(token);

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid fund ID' }, { status: 400 });
    }

    const fundsCollection = await getCollection('funds');

    // Check if fund is being used in any transactions
    const incomesCollection = await getCollection('incomes');
    const expensesCollection = await getCollection('expenses');

    const [incomeCount, expenseCount] = await Promise.all([
      incomesCollection.countDocuments({ fundId: new ObjectId(id) }),
      expensesCollection.countDocuments({ fundId: new ObjectId(id) })
    ]);

    if (incomeCount > 0 || expenseCount > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa quỹ đang có giao dịch' },
        { status: 400 }
      );
    }

    const result = await fundsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Không tìm thấy quỹ' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Xóa quỹ thành công' });
  } catch (error) {
    console.error('Error deleting fund:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
