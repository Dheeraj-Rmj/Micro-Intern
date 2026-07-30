import type { PrismaClient } from '@microintern/database';
import { AssessmentStatus } from '@microintern/database';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('ArchiveOldAssessmentsJob');

export async function archiveOldAssessments(prisma: PrismaClient): Promise<{ archivedCount: number }> {
  log.info('Executing scheduled job: archiveOldAssessments');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await prisma.assessment.updateMany({
    where: {
      status: AssessmentStatus.PUBLISHED,
      updatedAt: {
        lt: thirtyDaysAgo,
      },
    },
    data: {
      status: AssessmentStatus.ARCHIVED,
    },
  });

  log.info({ archivedCount: result.count }, 'archiveOldAssessments completed');
  return { archivedCount: result.count };
}
