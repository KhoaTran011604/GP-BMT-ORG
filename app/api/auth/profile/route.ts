import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, address } = body;

    const usersCollection = await getCollection('users');

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(payload.userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive fields
    const { password, ...userWithoutPassword } = result.value as any;

    return NextResponse.json({
      data: userWithoutPassword,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
