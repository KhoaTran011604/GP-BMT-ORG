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
    const status = searchParams.get('status');
    const parishId = searchParams.get('parishId');
    const assetType = searchParams.get('assetType');
    const available = searchParams.get('available'); // Filter for assets not currently rented

    const assetsCollection = await getCollection('assets');

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (parishId) query.parishId = parishId;
    if (assetType) query.assetType = assetType;

    let assets = await assetsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Filter out assets that are currently rented (have active rental contracts)
    if (available === 'true') {
      const rentalContractsCollection = await getCollection('rental_contracts');
      const activeContracts = await rentalContractsCollection
        .find({ status: 'active' })
        .project({ assetId: 1 })
        .toArray();

      const rentedAssetIds = new Set(
        activeContracts
          .map(c => c.assetId?.toString())
          .filter(Boolean)
      );

      assets = assets.filter(a => !rentedAssetIds.has(a._id.toString()));
    }

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
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

    if (!body.assetCode || !body.assetName || !body.parishId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assetsCollection = await getCollection('assets');

    const record = {
      assetCode: body.assetCode,
      assetName: body.assetName,
      assetType: body.assetType,
      parishId: body.parishId,
      parishName: body.parishName,
      location: body.location,
      area: body.area || 0,
      acquisitionDate: body.acquisitionDate ? new Date(body.acquisitionDate) : undefined,
      acquisitionValue: body.acquisitionValue || 0,
      currentValue: body.currentValue || 0,
      status: body.status || 'active',
      images: body.images || [],
      legalDocs: body.legalDocs,
      notes: body.notes,
      createdAt: new Date(),
    };

    const result = await assetsCollection.insertOne(record as any);

    return NextResponse.json(
      { data: { _id: result.insertedId, ...record } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
