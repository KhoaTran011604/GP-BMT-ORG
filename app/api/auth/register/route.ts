import { getCollection } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { User } from '@/lib/schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role } = await request.json();

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user: Omit<User, '_id'> = {
      email,
      password: hashedPassword,
      fullName,
      role: role || 'cha_xu',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(user as any);

    // Create token
    const token = await createToken({
      userId: result.insertedId.toString(),
      email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: result.insertedId,
          email,
          fullName,
          role,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'auth',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
