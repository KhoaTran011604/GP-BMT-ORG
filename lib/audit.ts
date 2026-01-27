import { getCollection } from '@/lib/db';
import { AuditLog } from '@/lib/schemas';
import { ObjectId } from 'mongodb';
import { NextRequest } from 'next/server';

export type AuditAction = 'create' | 'update' | 'delete' | 'approve';

export interface CreateAuditLogParams {
  userId: string;
  action: AuditAction;
  module: string;
  recordId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  request?: NextRequest;
}

/**
 * Extract client info from request
 */
export function getClientInfo(request?: NextRequest) {
  if (!request) {
    return { ipAddress: undefined, userAgent: undefined };
  }

  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;

  return { ipAddress, userAgent };
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    const { userId, action, module, recordId, oldValue, newValue, request } = params;
    const { ipAddress, userAgent } = getClientInfo(request);

    const auditLogsCollection = await getCollection('audit_logs');

    const auditLog: Omit<AuditLog, '_id'> = {
      userId: new ObjectId(userId),
      action,
      module,
      recordId: recordId ? new ObjectId(recordId) : undefined,
      oldValue: sanitizeValue(oldValue),
      newValue: sanitizeValue(newValue),
      ipAddress,
      userAgent,
      createdAt: new Date(),
    };

    await auditLogsCollection.insertOne(auditLog as any);
  } catch (error) {
    // Don't throw - audit logging should not break the main operation
    console.error('Error creating audit log:', error);
  }
}

/**
 * Sanitize values for audit log (remove sensitive fields, handle ObjectId)
 */
function sanitizeValue(value?: Record<string, any>): Record<string, any> | undefined {
  if (!value) return undefined;

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
  const sanitized: Record<string, any> = {};

  for (const [key, val] of Object.entries(value)) {
    // Skip sensitive fields
    if (sensitiveFields.some(f => key.toLowerCase().includes(f))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Convert ObjectId to string
    if (val instanceof ObjectId) {
      sanitized[key] = val.toString();
    } else if (val && typeof val === 'object' && val._bsontype === 'ObjectId') {
      sanitized[key] = val.toString();
    } else if (val instanceof Date) {
      sanitized[key] = val.toISOString();
    } else if (typeof val === 'object' && val !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeValue(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Calculate diff between old and new values
 */
export function calculateDiff(
  oldValue?: Record<string, any>,
  newValue?: Record<string, any>
): { field: string; oldVal: any; newVal: any }[] {
  const diff: { field: string; oldVal: any; newVal: any }[] = [];

  if (!oldValue && !newValue) return diff;

  const allKeys = new Set([
    ...Object.keys(oldValue || {}),
    ...Object.keys(newValue || {}),
  ]);

  for (const key of allKeys) {
    // Skip internal fields
    if (['_id', 'createdAt', 'updatedAt'].includes(key)) continue;

    const oldVal = oldValue?.[key];
    const newVal = newValue?.[key];

    // Simple comparison (stringify for objects)
    const oldStr = JSON.stringify(oldVal);
    const newStr = JSON.stringify(newVal);

    if (oldStr !== newStr) {
      diff.push({ field: key, oldVal, newVal });
    }
  }

  return diff;
}
