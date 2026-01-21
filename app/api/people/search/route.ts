import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET - Search people
export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const type = searchParams.get('type') || 'name'; // name, saint, phone, all
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!keyword || keyword.length < 1) {
      return NextResponse.json({ data: [] });
    }

    const peopleCollection = await getCollection('people');
    const familiesCollection = await getCollection('families');

    // Build search query based on type
    let query: any = {};
    const regexKeyword = { $regex: keyword, $options: 'i' };

    switch (type) {
      case 'name':
        query = { fullName: regexKeyword };
        break;
      case 'saint':
        query = { saintName: regexKeyword };
        break;
      case 'phone':
        query = { phone: regexKeyword };
        break;
      case 'all':
      default:
        query = {
          $or: [
            { fullName: regexKeyword },
            { saintName: regexKeyword },
            { phone: regexKeyword },
            { email: regexKeyword },
          ],
        };
        break;
    }

    const people = await peopleCollection
      .find(query)
      .sort({ fullName: 1 })
      .limit(limit)
      .toArray();

    // Get family info for each person
    const familyIds = [...new Set(people.map(p => p.familyId?.toString()).filter(Boolean))];
    const families = await familiesCollection
      .find({ _id: { $in: familyIds.map(id => new ObjectId(id)) } })
      .toArray();

    const familyMap = new Map(families.map(f => [f._id.toString(), f]));

    const peopleWithFamily = people.map(person => ({
      ...person,
      family: person.familyId ? familyMap.get(person.familyId.toString()) : undefined,
    }));

    return NextResponse.json({ data: peopleWithFamily });
  } catch (error) {
    console.error('Error searching people:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
