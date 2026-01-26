import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { User } from '@/lib/schemas';
import { verifyToken, getTokenFromCookie, hashPassword } from '@/lib/auth';
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
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
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

    // Only super_admin can edit users
    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Chỉ Super Admin mới có quyền cập nhật người dùng' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fullName, role, parishId, status, password } = body;

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Get existing user
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cannot change super_admin role or modify another super_admin
    if (existingUser.role === 'super_admin' && decoded.userId !== id) {
      return NextResponse.json(
        { error: 'Không thể chỉnh sửa tài khoản Super Admin khác' },
        { status: 403 }
      );
    }

    // Cannot promote to super_admin
    if (role === 'super_admin' && existingUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Không thể nâng cấp lên Super Admin' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (fullName) updateData.fullName = fullName;
    if (role && existingUser.role !== 'super_admin') updateData.role = role;
    if (parishId !== undefined) {
      updateData.parishId = parishId ? new ObjectId(parishId) : null;
    }
    if (status) updateData.status = status;
    if (password) {
      updateData.password = await hashPassword(password);
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      data: updatedUser,
      message: 'Cập nhật người dùng thành công'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
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

    // Only super_admin can delete users
    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Chỉ Super Admin mới có quyền xóa người dùng' },
        { status: 403 }
      );
    }

    // Cannot delete yourself
    if (decoded.userId === id) {
      return NextResponse.json(
        { error: 'Không thể xóa tài khoản của chính mình' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if user exists and is not super_admin
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Không thể xóa tài khoản Super Admin' },
        { status: 403 }
      );
    }

    await usersCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: 'Xóa người dùng thành công'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
