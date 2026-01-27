import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { RentalContract } from '@/lib/schemas';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
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

    const db = await getDatabase();
    const collection = db.collection<RentalContract>('rental_contracts');

    const contract = await collection.findOne({ _id: new ObjectId(id) });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: contract });

  } catch (error) {
    console.error('Error fetching rental contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental contract' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const db = await getDatabase();
    const collection = db.collection<RentalContract>('rental_contracts');

    // Check if contract exists
    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    // Update allowed fields
    if (body.assetId !== undefined) updateData.assetId = new ObjectId(body.assetId);
    if (body.propertyName !== undefined) updateData.propertyName = body.propertyName;
    if (body.propertyAddress !== undefined) updateData.propertyAddress = body.propertyAddress;
    if (body.propertyArea !== undefined) updateData.propertyArea = body.propertyArea;
    if (body.propertyType !== undefined) updateData.propertyType = body.propertyType;
    if (body.tenantName !== undefined) updateData.tenantName = body.tenantName;
    if (body.tenantIdNumber !== undefined) updateData.tenantIdNumber = body.tenantIdNumber;
    if (body.tenantPhone !== undefined) updateData.tenantPhone = body.tenantPhone;
    if (body.tenantAddress !== undefined) updateData.tenantAddress = body.tenantAddress;
    if (body.tenantEmail !== undefined) updateData.tenantEmail = body.tenantEmail;
    if (body.tenantBankName !== undefined) updateData.tenantBankName = body.tenantBankName;
    if (body.tenantBankAccount !== undefined) updateData.tenantBankAccount = body.tenantBankAccount;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate);
    if (body.rentAmount !== undefined) updateData.rentAmount = body.rentAmount;
    if (body.paymentCycle !== undefined) updateData.paymentCycle = body.paymentCycle;
    if (body.depositAmount !== undefined) updateData.depositAmount = body.depositAmount;
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.bankAccount !== undefined) updateData.bankAccount = body.bankAccount;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.contractFiles !== undefined) updateData.contractFiles = body.contractFiles;
    if (body.terms !== undefined) updateData.terms = body.terms;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.terminatedAt !== undefined) updateData.terminatedAt = new Date(body.terminatedAt);
    if (body.terminatedReason !== undefined) updateData.terminatedReason = body.terminatedReason;

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updated = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: 'Contract updated successfully',
      data: updated
    });

  } catch (error) {
    console.error('Error updating rental contract:', error);
    return NextResponse.json(
      { error: 'Failed to update rental contract' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const db = await getDatabase();
    const collection = db.collection<RentalContract>('rental_contracts');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Contract deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting rental contract:', error);
    return NextResponse.json(
      { error: 'Failed to delete rental contract' },
      { status: 500 }
    );
  }
}
