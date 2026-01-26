import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { RentalContract, Income } from '@/lib/schemas';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.fundId || !body.amount || !body.incomeDate || !body.paymentPeriod) {
      return NextResponse.json(
        { error: 'Missing required fields: fundId, amount, incomeDate, paymentPeriod' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const contractsCollection = db.collection<RentalContract>('rental_contracts');
    const incomesCollection = db.collection<Income>('incomes');

    // Get contract details
    const contract = await contractsCollection.findOne({ _id: new ObjectId(id) });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Generate income code
    const incomeDate = new Date(body.incomeDate);
    const year = incomeDate.getFullYear();
    const month = incomeDate.getMonth() + 1;

    const lastIncome = await incomesCollection
      .find({ incomeCode: { $regex: `^THU-${year}` } })
      .sort({ incomeCode: -1 })
      .limit(1)
      .toArray();

    let sequence = 1;
    if (lastIncome.length > 0 && lastIncome[0].incomeCode) {
      const lastSeq = parseInt(lastIncome[0].incomeCode.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    const incomeCode = `THU-${year}${String(month).padStart(2, '0')}-${String(sequence).padStart(4, '0')}`;

    // Create income record
    // Default categoryId for rental contract income (Thu từ cho thuê BĐS)
    const DEFAULT_RENTAL_INCOME_CATEGORY_ID = '697718196a780e5859f59bcf';

    const newIncome: Income = {
      incomeCode,
      parishId: contract.parishId,
      fundId: new ObjectId(body.fundId),
      categoryId: new ObjectId(DEFAULT_RENTAL_INCOME_CATEGORY_ID),
      amount: body.amount,
      paymentMethod: body.paymentMethod || contract.paymentMethod === 'transfer' ? 'online' : 'offline',
      bankAccountId: body.bankAccountId ? new ObjectId(body.bankAccountId) : undefined,
      bankAccount: body.bankAccount || contract.bankAccount,
      payerName: contract.tenantName,
      description: `Tiền thuê ${contract.propertyName} - Kỳ ${body.paymentPeriod} - HĐ ${contract.contractCode}`,
      fiscalYear: year,
      fiscalPeriod: month,
      incomeDate: incomeDate,
      images: body.images || [],
      status: 'pending',
      submittedBy: new ObjectId(decoded.userId),
      submittedAt: new Date(),
      notes: body.notes || `Chuyển đổi từ hợp đồng thuê ${contract.contractCode}`,
      // Reference to source contract for transparency
      rentalContractId: new ObjectId(id),
      sourceType: 'rental_contract',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await incomesCollection.insertOne(newIncome);

    return NextResponse.json({
      message: 'Payment converted to income transaction successfully',
      data: {
        incomeId: result.insertedId,
        incomeCode,
        contract: {
          contractCode: contract.contractCode,
          propertyName: contract.propertyName,
          tenantName: contract.tenantName
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error converting payment:', error);
    return NextResponse.json(
      { error: 'Failed to convert payment to income transaction' },
      { status: 500 }
    );
  }
}
