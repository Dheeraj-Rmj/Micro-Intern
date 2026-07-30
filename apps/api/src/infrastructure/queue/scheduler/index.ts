import { createModuleLogger } from '@/core/logger.js';
import { checkSubmissionDeadlines } from './submission-deadlines.job.js';
import { sendInterviewReminders } from './interview-reminders.job.js';
import { cleanupExpiredTokens } from './cleanup-tokens.job.js';
import { archiveOldAssessments } from './archive-old-assessments.job.js';
import { refreshAnalytics } from './refresh-analytics.job.js';
import { retryFailedJobs } from './retry-failed-jobs.job.js';
import type { PrismaClient } from '@microintern/database';

const log = createModuleLogger('Scheduler');

export interface CronScheduleDefinition {
  name: string;
  cron: string;
  handler: (prisma: PrismaClient) => Promise<any>;
}

export const CRON_SCHEDULES: CronScheduleDefinition[] = [
  {
    name: 'submission-deadlines',
    cron: '*/5 * * * *', // every 5 minutes
    handler: checkSubmissionDeadlines,
  },
  {
    name: 'interview-reminders',
    cron: '0 9 * * *', // every day at 9 AM
    handler: sendInterviewReminders,
  },
  {
    name: 'cleanup-tokens',
    cron: '0 3 * * *', // every day at 3 AM
    handler: cleanupExpiredTokens,
  },
  {
    name: 'archive-old-assessments',
    cron: '0 2 * * *', // every day at 2 AM
    handler: archiveOldAssessments,
  },
  {
    name: 'refresh-analytics',
    cron: '0 */4 * * *', // every 4 hours
    handler: refreshAnalytics,
  },
  {
    name: 'retry-failed-jobs',
    cron: '*/15 * * * *', // every 15 minutes
    handler: async () => retryFailedJobs(),
  },
];

export async function runScheduledJob(name: string, prisma: PrismaClient): Promise<any> {
  const schedule = CRON_SCHEDULES.find((s) => s.name === name);
  if (!schedule) {
    throw new Error(`Scheduled job not found: ${name}`);
  }
  const startTime = Date.now();
  try {
    const result = await schedule.handler(prisma);
    const durationMs = Date.now() - startTime;
    await prisma.scheduledJobLog.create({
      data: {
        jobName: name,
        status: 'COMPLETED',
        durationMs,
        itemsProcessed: result?.count || result?.expiredCount || result?.deletedCount || 0,
      },
    });
    return result;
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    await prisma.scheduledJobLog.create({
      data: {
        jobName: name,
        status: 'FAILED',
        durationMs,
        errorMessage: err?.message || String(err),
      },
    });
    throw err;
  }
}
