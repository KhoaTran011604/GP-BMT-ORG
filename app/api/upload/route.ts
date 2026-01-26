import { NextRequest, NextResponse } from 'next/server';
import { uploadImages } from '@/lib/cloudinary';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import getDatabase from '@/lib/db';
import { MediaFile } from '@/lib/schemas';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    // Optional: entity info for creating media_file records
    const entityType = formData.get('entityType') as string | null;
    const entityId = formData.get('entityId') as string | null;
    const category = formData.get('category') as string | null;

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed' },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Only image files are allowed' },
          { status: 400 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 10MB' },
          { status: 400 }
        );
      }
    }

    const urls = await uploadImages(files);

    // If entityType and entityId are provided, create media_file records
    let mediaFileIds: string[] = [];
    if (entityType && entityId) {
      try {
        const db = await getDatabase();
        const collection = db.collection<MediaFile>('media_files');
        const now = new Date();
        const userId = new ObjectId(decoded.userId);
        const entId = new ObjectId(entityId);

        const mediaFiles: MediaFile[] = urls.map((url, index) => ({
          fileName: files[index]?.name || url.split('/').pop() || 'unknown',
          fileKey: url,
          bucketName: 'cloudinary',
          fileUrl: url,
          cdnUrl: url,
          mimeType: files[index]?.type || 'image/jpeg',
          fileSize: files[index]?.size,
          fileType: 'image' as const,
          entityType: entityType as MediaFile['entityType'],
          entityId: entId,
          category: category || 'screenshot',
          uploadedBy: userId,
          uploadedAt: now,
          isPublic: false,
          status: 'active' as const
        }));

        const result = await collection.insertMany(mediaFiles);
        mediaFileIds = Object.values(result.insertedIds).map(id => id.toString());
      } catch (dbError) {
        console.error('Error creating media file records:', dbError);
        // Don't fail the upload, just log the error
      }
    }

    return NextResponse.json({
      urls,
      mediaFileIds,
      message: 'Images uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
