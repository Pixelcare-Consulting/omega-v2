import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export type ActivityEventType = 'user' | 'system' | 'security' | 'data';
export type ActivitySeverity = 'info' | 'warning' | 'error' | 'critical';

interface LogActivityOptions {
  user: string;
  action: string;
  eventType: ActivityEventType;
  severity: ActivitySeverity;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export async function logActivity({
  user,
  action,
  eventType,
  severity,
  details,
  ipAddress,
  userAgent,
  metadata,
}: LogActivityOptions) {
  try {
    const data: Prisma.ActivityLogCreateInput = {
      user,
      action,
      eventType,
      severity,
      details,
      ipAddress,
      userAgent,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
    };

    await prisma.activityLog.create({ data });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw the error to prevent disrupting the main application flow
  }
}

// Example usage:
// await logActivity({
//   user: 'john.doe@example.com',
//   action: 'User Login',
//   eventType: 'security',
//   severity: 'info',
//   details: 'Successful login attempt',
//   ipAddress: '192.168.1.1',
//   userAgent: 'Mozilla/5.0...',
//   metadata: { loginMethod: 'password' }
// }); 