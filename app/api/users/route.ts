import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/db';
import { User, Parish } from '@/lib/schemas';
import { verifyToken, getTokenFromCookie, hashPassword } from '@/lib/auth';
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

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');
    const parishesCollection = db.collection<Parish>('parishes');

    // Get all users (exclude password)
    const users = await usersCollection
      .find({})
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    // Get parish names for users with parishId
    const parishIds = users
      .filter(u => u.parishId)
      .map(u => u.parishId!);

    const parishes = parishIds.length > 0
      ? await parishesCollection
          .find({ _id: { $in: parishIds } })
          .toArray()
      : [];

    const parishMap = new Map(parishes.map(p => [p._id!.toString(), p.parishName]));

    // Add parish names to users
    const usersWithParish = users.map(u => ({
      ...u,
      parishName: u.parishId ? parishMap.get(u.parishId.toString()) : null
    }));

    return NextResponse.json({
      data: usersWithParish,
      total: usersWithParish.length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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

    // Only super_admin can create users
    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Chỉ Super Admin mới có quyền tạo người dùng' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, fullName, role, parishId, status } = body;

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Cannot create super_admin
    if (role === 'super_admin') {
      return NextResponse.json(
        { error: 'Không thể tạo tài khoản Super Admin' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã tồn tại trong hệ thống' },
        { status: 400 }
      );
    }

    const now = new Date();
    const hashedPassword = await hashPassword(password);

    const newUser: User = {
      email,
      password: hashedPassword,
      fullName,
      role,
      parishId: parishId ? new ObjectId(parishId) : undefined,
      status: status || 'active',
      createdAt: now,
      updatedAt: now
    };

    const result = await usersCollection.insertOne(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      data: { ...userWithoutPassword, _id: result.insertedId },
      message: 'Tạo người dùng thành công'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
