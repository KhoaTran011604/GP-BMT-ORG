import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const fundsCollection = await getCollection('funds');

    const query = category ? { category } : {};

    const funds = await fundsCollection
      .find(query)
      .sort({ fundCode: 1 })
      .toArray();

    return NextResponse.json({ data: funds });
  } catch (error) {
    console.error('Error fetching funds:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
