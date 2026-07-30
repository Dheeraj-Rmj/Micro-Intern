import { createModuleLogger } from "@/core/logger.js";
import { PrismaClient, CandidateJourneyStatus } from "@microintern/database";
import { CandidateJourneyService } from "../CandidateJourneyService.js";
import type { SkillTrailConfigurationType } from "../../../management/application/use-cases/ConfigureSkillTrailUseCase.js";

const log = createModuleLogger("ProcessSkillTrailProgressionUseCase");

export type ProcessSkillTrailProgressionInput = {
  journeyId: string;
  performanceClassification:
    | "Exceptional"
    | "Outstanding"
    | "Excellent"
    | "Above Average"
    | "Good"
    | "Average"
    | "Below Average"
    | "Needs Improvement";
  actorId: string;
};

/**
 * Phase 5 AI Skill Trail Config:
 * Automatically advances or rejects a candidate based on the Recruiter's Skill Trail Configuration Rules.
 */
export class ProcessSkillTrailProgressionUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly journeyService: CandidateJourneyService,
  ) {}

  async execute(input: ProcessSkillTrailProgressionInput): Promise<void> {
    log.info(
      { journeyId: input.journeyId, performance: input.performanceClassification },
      "Processing automated Skill Trail progression",
    );

    try {
      // 1. Fetch Journey and linked Skill Trail
      const journey = await this.prisma.candidateJourney.findUnique({
        where: { id: input.journeyId },
        include: { roleProfile: { include: { skillTrail: { include: { configuration: true } } } } },
      });

      if (!journey || !journey.roleProfile?.skillTrail?.configuration) {
        log.warn(
          "No Skill Trail Configuration found for this journey, skipping automated progression",
        );
        return;
      }

      const configRules = journey.roleProfile.skillTrail.configuration
        .rulesJson as unknown as SkillTrailConfigurationType;

      // 2. Determine Action based on performance classification vs required performance
      const levels = [
        "Needs Improvement",
        "Below Average",
        "Average",
        "Good",
        "Above Average",
        "Excellent",
        "Outstanding",
        "Exceptional",
      ];
      const candidateLevelIdx = levels.indexOf(input.performanceClassification);
      const requiredLevelIdx = levels.indexOf(configRules.requiredPerformance);

      if (candidateLevelIdx >= requiredLevelIdx) {
        // Candidate Passed!
        log.info("Candidate met or exceeded required performance. Advancing journey.");
        await this.journeyService.advanceJourney(
          {
            journeyId: journey.id,
            toStatus: CandidateJourneyStatus.INTERVIEW, // Simplification for demo
            reason: `Automated progression: Scored ${input.performanceClassification}`,
          },
          input.actorId,
        );

        // If 'Exceptional', we might trigger another specific event here.
      } else {
        // Candidate Failed!
        log.info("Candidate failed to meet required performance. Rejecting journey.");
        await this.journeyService.advanceJourney(
          {
            journeyId: journey.id,
            toStatus: CandidateJourneyStatus.REJECTED,
            reason: `Automated progression: Scored ${input.performanceClassification}, but required ${configRules.requiredPerformance}`,
          },
          input.actorId,
        );

        // If candidateFeedback rules allow, we can fire an event here that the Recovery Engine listens to
        if (configRules.candidateFeedback.enableLearningPlan) {
          log.info(
            "Candidate Feedback is enabled in Config. The Recovery Engine will pick this up.",
          );
          // Domain Event dispatch handled automatically by CandidateJourneyService.advanceJourney
        }
      }
    } catch (error) {
      log.error({ err: error }, "Failed to process automated progression");
      throw new Error("Failed to process automated Skill Trail progression");
    }
  }
}
