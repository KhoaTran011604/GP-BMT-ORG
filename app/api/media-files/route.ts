import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { MediaFile } from '@/lib/schemas';
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
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const status = searchParams.get('status') || 'active';

    const db = await getDatabase();
    const collection = db.collection<MediaFile>('media_files');

    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (entityType) {
      filter.entityType = entityType;
    }

    if (entityId) {
      filter.entityId = new ObjectId(entityId);
    }

    const files = await collection
      .find(filter)
      .sort({ uploadedAt: -1 })
      .toArray();

    return NextResponse.json({
      data: files,
      total: files.length
    });

  } catch (error) {
    console.error('Error fetching media files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
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
    const {
      fileName,
      fileKey,
      bucketName,
      fileUrl,
      cdnUrl,
      mimeType,
      fileSize,
      fileType,
      entityType,
      entityId,
      category,
      description,
      metadata,
      isPublic
    } = body;

    if (!fileName || !fileKey || !bucketName || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileKey, bucketName, entityType, entityId' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<MediaFile>('media_files');

    const now = new Date();
    const newFile: MediaFile = {
      fileName,
      fileKey,
      bucketName,
      fileUrl,
      cdnUrl,
      mimeType,
      fileSize,
      fileType: fileType || 'image',
      entityType,
      entityId: new ObjectId(entityId),
      category,
      description,
      metadata,
      uploadedBy: new ObjectId(decoded.userId),
      uploadedAt: now,
      isPublic: isPublic || false,
      status: 'active'
    };

    const result = await collection.insertOne(newFile);

    return NextResponse.json({
      data: { ...newFile, _id: result.insertedId },
      message: 'Media file created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating media file:', error);
    return NextResponse.json(
      { error: 'Failed to create media file' },
      { status: 500 }
    );
  }
}

// Batch create media files (for multiple uploads)
export async function PUT(request: NextRequest) {
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
    const { files, entityType, entityId } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<MediaFile>('media_files');

    const now = new Date();
    const userId = new ObjectId(decoded.userId);
    const entId = new ObjectId(entityId);

    const newFiles: MediaFile[] = files.map((file: any) => ({
      fileName: file.fileName || file.fileUrl?.split('/').pop() || 'unknown',
      fileKey: file.fileKey || file.fileUrl || '',
      bucketName: file.bucketName || 'cloudinary',
      fileUrl: file.fileUrl,
      cdnUrl: file.cdnUrl || file.fileUrl,
      mimeType: file.mimeType || 'image/jpeg',
      fileSize: file.fileSize,
      fileType: file.fileType || 'image',
      entityType,
      entityId: entId,
      category: file.category || 'screenshot',
      description: file.description,
      metadata: file.metadata,
      uploadedBy: userId,
      uploadedAt: now,
      isPublic: file.isPublic || false,
      status: 'active' as const
    }));

    const result = await collection.insertMany(newFiles);

    return NextResponse.json({
      data: {
        insertedCount: result.insertedCount,
        insertedIds: result.insertedIds
      },
      message: `${result.insertedCount} media files created successfully`
    });

  } catch (error) {
    console.error('Error batch creating media files:', error);
    return NextResponse.json(
      { error: 'Failed to create media files' },
      { status: 500 }
    );
  }
}
