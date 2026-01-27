import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET - List audit logs with filters
export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromCookie(request.headers.get('cookie') || '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    // Only super_admin and cha_quan_ly can view audit logs
    if (!payload || !['super_admin', 'cha_quan_ly'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const module = searchParams.get('module');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const recordId = searchParams.get('recordId');

    // Build query
    const query: any = {};

    if (module) {
      query.module = module;
    }

    if (action) {
      query.action = action;
    }

    if (userId) {
      query.userId = new ObjectId(userId);
    }

    if (recordId) {
      query.recordId = new ObjectId(recordId);
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const auditLogsCollection = await getCollection('audit_logs');
    const usersCollection = await getCollection('users');

    // Get total count
    const total = await auditLogsCollection.countDocuments(query);

    // Get paginated data
    const auditLogs = await auditLogsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Get unique user IDs
    const userIds = [...new Set(auditLogs.map(log => log.userId?.toString()).filter(Boolean))];

    // Fetch user information
    const users = await usersCollection
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .project({ _id: 1, fullName: 1, email: 1 })
      .toArray();

    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    // Enrich audit logs with user info
    const enrichedLogs = auditLogs.map(log => ({
      ...log,
      user: log.userId ? userMap.get(log.userId.toString()) : null,
    }));

    return NextResponse.json({
      data: enrichedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
