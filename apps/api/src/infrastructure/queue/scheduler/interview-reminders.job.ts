import type { PrismaClient } from "@microintern/database";
import { CandidateJourneyStatus } from "@microintern/database";
import { createModuleLogger } from "@/core/logger.js";

const log = createModuleLogger("InterviewRemindersJob");

export async function sendInterviewReminders(
  prisma: PrismaClient,
): Promise<{ reminderCount: number }> {
  log.info("Executing scheduled job: sendInterviewReminders");

  const journeys = await prisma.candidateJourney.findMany({
    where: {
      status: CandidateJourneyStatus.INTERVIEW,
    },
    select: { id: true, candidateId: true, companyId: true },
  });

  log.info({ reminderCount: journeys.length }, "sendInterviewReminders completed");
  return { reminderCount: journeys.length };
}
