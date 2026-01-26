import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { MediaFile } from '@/lib/schemas';
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
    const collection = db.collection<MediaFile>('media_files');

    const file = await collection.findOne({ _id: new ObjectId(id) });

    if (!file) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: file });

  } catch (error) {
    console.error('Error fetching media file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media file' },
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

    const db = await getDatabase();
    const collection = db.collection<MediaFile>('media_files');

    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      'fileName', 'description', 'category', 'metadata', 'isPublic', 'status'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updated = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      data: updated,
      message: 'Media file updated successfully'
    });

  } catch (error) {
    console.error('Error updating media file:', error);
    return NextResponse.json(
      { error: 'Failed to update media file' },
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
    const collection = db.collection<MediaFile>('media_files');

    const existing = await collection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json(
        { error: 'Media file not found' },
        { status: 404 }
      );
    }

    // Soft delete by changing status
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'deleted' } }
    );

    return NextResponse.json({
      message: 'Media file deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting media file:', error);
    return NextResponse.json(
      { error: 'Failed to delete media file' },
      { status: 500 }
    );
  }
}
