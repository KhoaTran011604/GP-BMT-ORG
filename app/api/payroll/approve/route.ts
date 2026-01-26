import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { Payroll, Expense, Contact, Staff } from '@/lib/schemas';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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

    // Only super_admin and cha_quan_ly can approve payroll
    const allowedRoles = ['super_admin', 'cha_quan_ly', 'cha_xu'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { period, parishId, paymentMethod = 'cash', bankAccountId, bankAccount } = body;

    if (!period || !parishId) {
      return NextResponse.json(
        { error: 'Missing required fields: period, parishId' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const payrollCollection = db.collection<Payroll>('payroll');
    const expensesCollection = db.collection<Expense>('expenses');
    const contactsCollection = db.collection<Contact>('contacts');
    const staffCollection = db.collection<Staff>('staff');

    // Get all draft payrolls for the period
    const draftPayrolls = await payrollCollection.find({
      period,
      status: 'draft'
    }).toArray();

    if (draftPayrolls.length === 0) {
      return NextResponse.json(
        { error: 'No draft payrolls found for this period' },
        { status: 400 }
      );
    }

    // Calculate total salary
    const totalNetSalary = draftPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

    const now = new Date();
    const year = now.getFullYear();
    const fiscalPeriod = parseInt(period.split('/')[0]);

    // Get current expense count for generating codes
    let expenseCount = await expensesCollection.countDocuments({
      expenseCode: { $regex: `^EXP-${year}-` }
    });

    // Create individual expenses for each payroll record
    const createdExpenses: Expense[] = [];
    const payrollIds = draftPayrolls.map(p => p._id!);

    for (const payroll of draftPayrolls) {
      expenseCount++;
      const expenseCode = `EXP-${year}-${String(expenseCount).padStart(4, '0')}`;

      const staffName = (payroll as any).staffName || 'Nhân viên';
      const staffCode = (payroll as any).staffCode || '';

      // Get staff phone from staff collection
      let receiverId: ObjectId | undefined;
      const staffIdObj = typeof payroll.staffId === 'string'
        ? new ObjectId(payroll.staffId)
        : payroll.staffId;
      const staff = await staffCollection.findOne({ _id: staffIdObj });
      const staffPhone = staff?.phone;

      if (staffPhone) {
        // Find existing contact by phone
        let contact = await contactsCollection.findOne({ phone: staffPhone });

        if (contact) {
          // Use existing contact
          receiverId = contact._id;
        } else {
          // Create new contact
          const newContact: Contact = {
            name: staffName,
            phone: staffPhone,
            status: 'active',
            createdAt: now,
            updatedAt: now
          };
          const contactResult = await contactsCollection.insertOne(newContact);
          receiverId = contactResult.insertedId;
        }
      }

      // Hardcoded expense category ID for salary expenses
      const SALARY_EXPENSE_CATEGORY_ID = '6971a8dd184a64c66bb004e1';

      const newExpense: Expense = {
        expenseCode,
        parishId: new ObjectId(parishId),
        categoryId: new ObjectId(SALARY_EXPENSE_CATEGORY_ID),
        amount: payroll.netSalary || 0,
        paymentMethod: paymentMethod as 'cash' | 'transfer',
        bankAccountId: bankAccountId ? new ObjectId(bankAccountId) : undefined,
        bankAccount,
        receiverId: receiverId,
        payeeName: staffName,
        description: `Chi lương tháng ${period} - ${staffCode} - ${staffName}`,
        fiscalYear: year,
        fiscalPeriod,
        expenseDate: now,
        images: [],
        status: 'pending',
        requestedBy: new ObjectId(decoded.userId),
        requestedAt: now,
        expenseType: 'salary',
        salaryPeriod: period,
        salaryItems: [{
          staffId: payroll.staffId,
          staffCode,
          staffName,
          basicSalary: payroll.basicSalary || 0,
          responsibilityAllowance: payroll.responsibilityAllowance || 0,
          mealAllowance: payroll.mealAllowance || 0,
          transportAllowance: payroll.transportAllowance || 0,
          advance: payroll.advance || 0,
          deductions: payroll.deductions || 0,
          netSalary: payroll.netSalary || 0
        }],
        createdAt: now,
        updatedAt: now
      };

      const result = await expensesCollection.insertOne(newExpense);
      createdExpenses.push({ ...newExpense, _id: result.insertedId });
    }

    // Update all draft payrolls to approved status
    await payrollCollection.updateMany(
      { _id: { $in: payrollIds } },
      {
        $set: {
          status: 'approved',
          approvedBy: new ObjectId(decoded.userId),
          updatedAt: now
        }
      }
    );

    return NextResponse.json({
      data: {
        expenses: createdExpenses,
        expensesCreated: createdExpenses.length,
        payrollsApproved: draftPayrolls.length,
        totalAmount: totalNetSalary
      },
      message: `Approved ${draftPayrolls.length} payrolls and created ${createdExpenses.length} expenses`
    });

  } catch (error) {
    console.error('Error approving payroll:', error);
    return NextResponse.json(
      { error: 'Failed to approve payroll' },
      { status: 500 }
    );
  }
}
