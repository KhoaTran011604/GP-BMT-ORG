import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = await getTokenFromCookie(request.headers.get('cookie') || '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await verifyToken(token);

        const assetsCollection = await getCollection('assets');
        const asset = await assetsCollection.findOne({
            _id: new ObjectId(params.id),
        });

        if (!asset) {
            return NextResponse.json(
                { error: 'Asset not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: asset });
    } catch (error) {
        console.error('Error fetching asset:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const assetsCollection = await getCollection('assets');

        const updateData: any = {
            updatedAt: new Date(),
        };

        // Update only provided fields
        if (body.assetCode !== undefined) updateData.assetCode = body.assetCode;
        if (body.assetName !== undefined) updateData.assetName = body.assetName;
        if (body.assetType !== undefined) updateData.assetType = body.assetType;
        if (body.parishId !== undefined) updateData.parishId = body.parishId;
        if (body.parishName !== undefined) updateData.parishName = body.parishName;
        if (body.location !== undefined) updateData.location = body.location;
        if (body.area !== undefined) updateData.area = body.area;
        if (body.acquisitionDate !== undefined) {
            updateData.acquisitionDate = body.acquisitionDate ? new Date(body.acquisitionDate) : null;
        }
        if (body.acquisitionValue !== undefined) updateData.acquisitionValue = body.acquisitionValue;
        if (body.currentValue !== undefined) updateData.currentValue = body.currentValue;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.notes !== undefined) updateData.notes = body.notes;
        if (body.images !== undefined) updateData.images = body.images;
        if (body.legalDocs !== undefined) updateData.legalDocs = body.legalDocs;

        const result = await assetsCollection.findOneAndUpdate(
            { _id: new ObjectId(params.id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result || !result.value) {
            return NextResponse.json(
                { error: 'Asset not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: result.value });
    } catch (error) {
        console.error('Error updating asset:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = await getTokenFromCookie(request.headers.get('cookie') || '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const assetsCollection = await getCollection('assets');

        const result = await assetsCollection.deleteOne({
            _id: new ObjectId(params.id),
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Asset not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Asset deleted successfully' });
    } catch (error) {
        console.error('Error deleting asset:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
