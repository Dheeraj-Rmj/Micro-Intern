import type { PrismaClient } from '@microintern/database';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('RefreshAnalyticsJob');

export async function refreshAnalytics(prisma: PrismaClient): Promise<{ refreshed: boolean }> {
  log.info('Executing scheduled job: refreshAnalytics');
  
  // Aggregate candidate portfolio scores and count verifications
  const portfolios = await prisma.candidatePortfolio.findMany({
    select: { id: true, candidateId: true },
  });

  for (const p of portfolios) {
    try {
      const verifications = await prisma.skillVerificationRecord.findMany({
        where: { candidateId: p.candidateId },
      });
      const avgConfidence =
        verifications.length > 0
          ? verifications.reduce((acc, v) => acc + v.confidenceScore, 0) / verifications.length
          : 0;

      await prisma.candidatePortfolio.update({
        where: { id: p.id },
        data: {
          overallSkillScore: Math.round(avgConfidence * 10) / 10,
        },
      });
    } catch (err) {
      log.error({ err, portfolioId: p.id }, 'Failed to refresh portfolio overallSkillScore');
    }
  }

  log.info({ count: portfolios.length }, 'refreshAnalytics completed');
  return { refreshed: true };
}
