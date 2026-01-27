import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { RentalContract, Contact } from '@/lib/schemas';
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
    const status = searchParams.get('status');

    const db = await getDatabase();
    const collection = db.collection<RentalContract>('rental_contracts');

    const filter: any = {};

    if (parishId) {
      filter.parishId = new ObjectId(parishId);
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const contracts = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      data: contracts,
      total: contracts.length
    });

  } catch (error) {
    console.error('Error fetching rental contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental contracts' },
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

    const body = await request.json();

    // Validate required fields
    if (!body.contractCode || !body.parishId || !body.assetId || !body.propertyName || !body.tenantName ||
      !body.startDate || !body.endDate || !body.rentAmount) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc (Mã hợp đồng, Giáo xứ, Tài sản, Tên BDS, Tên bên thuê, Ngày bắt đầu, Ngày kết thúc, Tiền thuê)' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<RentalContract>('rental_contracts');
    const contactsCollection = db.collection<Contact>('contacts');

    // Check if contract code already exists
    const existing = await collection.findOne({ contractCode: body.contractCode });
    if (existing) {
      return NextResponse.json(
        { error: 'Contract code already exists' },
        { status: 400 }
      );
    }

    // Check/Create contact for tenant based on phone number
    let tenantContactId: ObjectId | undefined;

    if (body.tenantPhone) {
      // Normalize phone number (remove spaces, dashes)
      const normalizedPhone = body.tenantPhone.replace(/[\s-]/g, '');

      // Check if contact with this phone already exists
      const existingContact = await contactsCollection.findOne({
        phone: normalizedPhone,
        status: 'active'
      });

      if (existingContact && existingContact._id) {
        // Use existing contact
        tenantContactId = existingContact._id;

        // Update bank info if contact doesn't have it and user provided it
        const needsBankUpdate = (!existingContact.bankName && body.tenantBankName) ||
                                (!existingContact.bankAccountNumber && body.tenantBankAccount);
        if (needsBankUpdate) {
          await contactsCollection.updateOne(
            { _id: existingContact._id },
            {
              $set: {
                ...(body.tenantBankName && !existingContact.bankName ? { bankName: body.tenantBankName } : {}),
                ...(body.tenantBankAccount && !existingContact.bankAccountNumber ? { bankAccountNumber: body.tenantBankAccount } : {}),
                updatedAt: new Date()
              }
            }
          );
        }
      } else {
        // Create new contact
        const newContact: Contact = {
          name: body.tenantName,
          phone: normalizedPhone,
          bankName: body.tenantBankName || undefined,
          bankAccountNumber: body.tenantBankAccount || undefined,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const contactResult = await contactsCollection.insertOne(newContact);
        tenantContactId = contactResult.insertedId;
      }
    }

    const newContract: RentalContract = {
      contractCode: body.contractCode,
      parishId: new ObjectId(body.parishId),
      assetId: new ObjectId(body.assetId),
      propertyName: body.propertyName,
      propertyAddress: body.propertyAddress,
      propertyArea: body.propertyArea,
      propertyType: body.propertyType || 'other',
      tenantName: body.tenantName,
      tenantIdNumber: body.tenantIdNumber,
      tenantPhone: body.tenantPhone,
      tenantAddress: body.tenantAddress,
      tenantEmail: body.tenantEmail,
      tenantBankName: body.tenantBankName,
      tenantBankAccount: body.tenantBankAccount,
      tenantContactId: tenantContactId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      rentAmount: body.rentAmount,
      paymentCycle: body.paymentCycle || 'monthly',
      depositAmount: body.depositAmount || 0,
      paymentMethod: body.paymentMethod || 'offline',
      bankAccountId: body.bankAccountId ? new ObjectId(body.bankAccountId) : undefined,
      bankAccount: body.bankAccount,
      status: body.status || 'active',
      contractFiles: body.contractFiles || [],
      terms: body.terms,
      notes: body.notes,
      createdBy: new ObjectId(decoded.userId),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newContract);

    return NextResponse.json({
      message: 'Contract created successfully',
      data: { _id: result.insertedId, ...newContract }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating rental contract:', error);
    return NextResponse.json(
      { error: 'Failed to create rental contract' },
      { status: 500 }
    );
  }
}
