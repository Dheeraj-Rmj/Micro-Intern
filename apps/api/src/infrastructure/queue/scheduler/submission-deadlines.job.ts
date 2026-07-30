import type { PrismaClient } from "@microintern/database";
import { SubmissionStatus } from "@microintern/database";
import { createModuleLogger } from "@/core/logger.js";

const log = createModuleLogger("SubmissionDeadlinesJob");

export async function checkSubmissionDeadlines(
  prisma: PrismaClient,
): Promise<{ expiredCount: number }> {
  log.info("Executing scheduled job: checkSubmissionDeadlines");
  const now = new Date();

  // Find submissions that are IN_PROGRESS and past deadline
  const expiredSubmissions = await prisma.submission.findMany({
    where: {
      status: SubmissionStatus.IN_PROGRESS,
      expiresAt: {
        lt: now,
      },
    },
    select: { id: true, candidateId: true, assessmentId: true },
  });

  let expiredCount = 0;
  for (const sub of expiredSubmissions) {
    try {
      await prisma.submission.update({
        where: { id: sub.id },
        data: {
          status: SubmissionStatus.EXPIRED,
        },
      });
      expiredCount++;
    } catch (err) {
      log.error({ err, submissionId: sub.id }, "Failed to mark submission as EXPIRED");
    }
  }

  log.info({ expiredCount }, "checkSubmissionDeadlines completed");
  return { expiredCount };
}
