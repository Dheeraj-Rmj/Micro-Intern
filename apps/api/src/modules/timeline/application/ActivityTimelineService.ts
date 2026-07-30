import { prisma } from '@/core/database.js';

export interface IActivityTimelineFilter {
  assessmentId?: string;
  companyId?: string;
  userId?: string;
  limit?: number;
}

export class ActivityTimelineService {
  /**
   * Retrieve structured Activity Timeline for an Enterprise Assessment, Company, or User.
   */
  public async getTimeline(filter: IActivityTimelineFilter): Promise<any[]> {
    return prisma.activityTimelineEntry.findMany({
      where: {
        ...(filter.assessmentId ? { assessmentId: filter.assessmentId } : {}),
        ...(filter.companyId ? { companyId: filter.companyId } : {}),
        ...(filter.userId ? { userId: filter.userId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: filter.limit || 50,
    });
  }
}

export const activityTimelineService = new ActivityTimelineService();
