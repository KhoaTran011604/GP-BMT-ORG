import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { Contact } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const contactsCollection = await getCollection('contacts');

    // Build query
    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const contacts = await contactsCollection
      .find(query)
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({ data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
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
    const { name, phone, bankName, bankBranch, bankAccountNumber } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Tên là bắt buộc' },
        { status: 400 }
      );
    }

    const contactsCollection = await getCollection('contacts');
    const now = new Date();

    const newContact: Contact = {
      name: name.trim(),
      phone: phone?.trim() || undefined,
      bankName: bankName?.trim() || undefined,
      bankBranch: bankBranch?.trim() || undefined,
      bankAccountNumber: bankAccountNumber?.trim() || undefined,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const result = await contactsCollection.insertOne(newContact);

    return NextResponse.json({
      data: { ...newContact, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
