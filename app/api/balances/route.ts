import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// API tính balance cho bank accounts và funds
// account_balance = sum(income where account_id = A) - sum(expense where account_id = A) ± sum(adjustment where account_id = A)
// fund_balance = sum(income where fund_id = X) - sum(expense where fund_id = X) ± sum(adjustment where fund_id = X)

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
    const type = searchParams.get('type'); // 'bank_account' | 'fund'
    const id = searchParams.get('id'); // bankAccountId or fundId (optional - if not provided, return all)

    if (!type || !['bank_account', 'fund'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "bank_account" or "fund"' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    if (type === 'bank_account') {
      const balances = await calculateBankAccountBalances(db, id);
      return NextResponse.json({ data: balances });
    } else {
      const balances = await calculateFundBalances(db, id);
      return NextResponse.json({ data: balances });
    }

  } catch (error) {
    console.error('Error calculating balances:', error);
    return NextResponse.json(
      { error: 'Failed to calculate balances' },
      { status: 500 }
    );
  }
}

async function calculateBankAccountBalances(db: any, bankAccountId?: string | null) {
  const matchCondition: any = { status: 'approved' };

  if (bankAccountId) {
    matchCondition.bankAccountId = new ObjectId(bankAccountId);
  } else {
    matchCondition.bankAccountId = { $exists: true, $ne: null };
  }

  // Tính tổng income theo bankAccountId
  const incomeAggregation = await db.collection('incomes').aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$bankAccountId',
        totalIncome: { $sum: '$amount' }
      }
    }
  ]).toArray();

  // Tính tổng expense theo bankAccountId
  const expenseAggregation = await db.collection('expenses').aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$bankAccountId',
        totalExpense: { $sum: '$amount' }
      }
    }
  ]).toArray();

  // Tính tổng adjustment theo bankAccountId
  const adjustmentMatchCondition: any = {};
  if (bankAccountId) {
    adjustmentMatchCondition.bankAccountId = new ObjectId(bankAccountId);
  } else {
    adjustmentMatchCondition.bankAccountId = { $exists: true, $ne: null };
  }

  const adjustmentAggregation = await db.collection('adjustments').aggregate([
    { $match: adjustmentMatchCondition },
    {
      $group: {
        _id: { bankAccountId: '$bankAccountId', adjustmentType: '$adjustmentType' },
        total: { $sum: '$amount' }
      }
    }
  ]).toArray();

  // Tạo map để dễ lookup
  const incomeMap = new Map(incomeAggregation.map((i: any) => [i._id?.toString(), i.totalIncome]));
  const expenseMap = new Map(expenseAggregation.map((e: any) => [e._id?.toString(), e.totalExpense]));

  // Map adjustment - tách increase và decrease
  const adjustmentIncreaseMap = new Map<string, number>();
  const adjustmentDecreaseMap = new Map<string, number>();

  adjustmentAggregation.forEach((a: any) => {
    const accountId = a._id.bankAccountId?.toString();
    if (a._id.adjustmentType === 'increase') {
      adjustmentIncreaseMap.set(accountId, a.total);
    } else {
      adjustmentDecreaseMap.set(accountId, a.total);
    }
  });

  // Lấy tất cả bank accounts để tính balance
  const bankAccountFilter: any = { status: 'active' };
  if (bankAccountId) {
    bankAccountFilter._id = new ObjectId(bankAccountId);
  }

  const bankAccounts = await db.collection('bank_accounts').find(bankAccountFilter).toArray();

  const balances = bankAccounts.map((account: any) => {
    const accountIdStr = account._id.toString();
    const totalIncome = incomeMap.get(accountIdStr) || 0;
    const totalExpense = expenseMap.get(accountIdStr) || 0;
    const totalAdjustmentIncrease = adjustmentIncreaseMap.get(accountIdStr) || 0;
    const totalAdjustmentDecrease = adjustmentDecreaseMap.get(accountIdStr) || 0;

    // balance = income - expense + increase - decrease
    const balance = totalIncome - totalExpense + totalAdjustmentIncrease - totalAdjustmentDecrease;

    return {
      _id: account._id,
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      totalIncome,
      totalExpense,
      totalAdjustmentIncrease,
      totalAdjustmentDecrease,
      balance
    };
  });

  return bankAccountId ? balances[0] : balances;
}

async function calculateFundBalances(db: any, fundId?: string | null) {
  const incomeMatchCondition: any = { status: 'approved' };

  if (fundId) {
    incomeMatchCondition.fundId = new ObjectId(fundId);
  } else {
    incomeMatchCondition.fundId = { $exists: true, $ne: null };
  }

  // Tính tổng income theo fundId
  const incomeAggregation = await db.collection('incomes').aggregate([
    { $match: incomeMatchCondition },
    {
      $group: {
        _id: '$fundId',
        totalIncome: { $sum: '$amount' }
      }
    }
  ]).toArray();

  // Tính tổng expense theo fundId (expense có thể không có fundId)
  const expenseMatchCondition: any = { status: 'approved' };
  if (fundId) {
    expenseMatchCondition.fundId = new ObjectId(fundId);
  } else {
    expenseMatchCondition.fundId = { $exists: true, $ne: null };
  }

  const expenseAggregation = await db.collection('expenses').aggregate([
    { $match: expenseMatchCondition },
    {
      $group: {
        _id: '$fundId',
        totalExpense: { $sum: '$amount' }
      }
    }
  ]).toArray();

  // Tính tổng adjustment theo fundId
  const adjustmentMatchCondition: any = {};
  if (fundId) {
    adjustmentMatchCondition.fundId = new ObjectId(fundId);
  } else {
    adjustmentMatchCondition.fundId = { $exists: true, $ne: null };
  }

  const adjustmentAggregation = await db.collection('adjustments').aggregate([
    { $match: adjustmentMatchCondition },
    {
      $group: {
        _id: { fundId: '$fundId', adjustmentType: '$adjustmentType' },
        total: { $sum: '$amount' }
      }
    }
  ]).toArray();

  // Tạo map để dễ lookup
  const incomeMap = new Map(incomeAggregation.map((i: any) => [i._id?.toString(), i.totalIncome]));
  const expenseMap = new Map(expenseAggregation.map((e: any) => [e._id?.toString(), e.totalExpense]));

  // Map adjustment - tách increase và decrease
  const adjustmentIncreaseMap = new Map<string, number>();
  const adjustmentDecreaseMap = new Map<string, number>();

  adjustmentAggregation.forEach((a: any) => {
    const fId = a._id.fundId?.toString();
    if (a._id.adjustmentType === 'increase') {
      adjustmentIncreaseMap.set(fId, a.total);
    } else {
      adjustmentDecreaseMap.set(fId, a.total);
    }
  });

  // Lấy tất cả funds để tính balance
  const fundFilter: any = {};
  if (fundId) {
    fundFilter._id = new ObjectId(fundId);
  }

  const funds = await db.collection('funds').find(fundFilter).toArray();

  const balances = funds.map((fund: any) => {
    const fundIdStr = fund._id.toString();
    const totalIncome = incomeMap.get(fundIdStr) || 0;
    const totalExpense = expenseMap.get(fundIdStr) || 0;
    const totalAdjustmentIncrease = adjustmentIncreaseMap.get(fundIdStr) || 0;
    const totalAdjustmentDecrease = adjustmentDecreaseMap.get(fundIdStr) || 0;

    // balance = income - expense + increase - decrease
    const balance = totalIncome - totalExpense + totalAdjustmentIncrease - totalAdjustmentDecrease;

    return {
      _id: fund._id,
      fundCode: fund.fundCode,
      fundName: fund.fundName,
      category: fund.category,
      totalIncome,
      totalExpense,
      totalAdjustmentIncrease,
      totalAdjustmentDecrease,
      balance
    };
  });

  return fundId ? balances[0] : balances;
}
