import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";
import {
  CandidateJourneyStatus,
  EvidenceType,
  EvidenceVerificationStatus,
  SkillVerificationStatus,
} from "@microintern/database";
import { createModuleLogger } from "@/core/logger.js";
import type { CandidateJourneyService } from "./CandidateJourneyService.js";
import type { EvidenceService } from "@/modules/evidence/application/EvidenceService.js";
import type { SkillVerificationService } from "@/modules/skill-verification/application/SkillVerificationService.js";
import type { ICandidateJourneyRepository } from "../domain/ICandidateJourneyRepository.js";

const log = createModuleLogger("CandidateJourneyAutomationListener");

export class CandidateJourneyAutomationListener {
  constructor(
    private readonly journeyRepo: ICandidateJourneyRepository,
    private readonly journeyService: CandidateJourneyService,
    private readonly evidenceService: EvidenceService,
    private readonly verificationService: SkillVerificationService,
  ) {}

  registerListeners(): void {
    log.info(
      "Registering event-driven automation listeners for CandidateJourney, Evidence, and SkillVerification",
    );

    eventBus.on(DOMAIN_EVENTS.ASSESSMENT_SUBMITTED, async (payload: any) => {
      try {
        log.info(
          { submissionId: payload.submissionId },
          "Automation: Processing ASSESSMENT_SUBMITTED event",
        );

        // 1. Create candidate evidence record for the submission
        await this.evidenceService.registerEvidence(
          {
            candidateId: payload.candidateId,
            submissionId: payload.submissionId,
            title: `Assessment Submission ${payload.submissionId.slice(0, 8)}`,
            type: EvidenceType.GITHUB_REPO,
            url:
              payload.repoUrl || `https://app.microintern.com/submissions/${payload.submissionId}`,
            description: "Automated evidence generated from assessment submission",
          },
          "system-automation",
        );

        // 2. Advance journey to ASSESSMENT_SUBMITTED if an active journey exists
        const journeys = await this.journeyRepo.listByCandidate(payload.candidateId);
        const activeJourney = journeys.find(
          (j) =>
            j.status === CandidateJourneyStatus.ASSESSMENT_STARTED ||
            j.assessmentId === payload.assessmentId,
        );

        if (activeJourney) {
          await this.journeyService.advanceJourney(
            {
              journeyId: activeJourney.id,
              toStatus: CandidateJourneyStatus.ASSESSMENT_SUBMITTED,
              reason: "Automated transition on assessment submission",
            },
            "system-automation",
          );
        }
      } catch (err) {
        log.error({ err, payload }, "Failed to process ASSESSMENT_SUBMITTED automation");
      }
    });

    eventBus.on(DOMAIN_EVENTS.EVALUATION_COMPLETED, async (payload: any) => {
      try {
        log.info(
          { evaluationId: payload.evaluationId },
          "Automation: Processing EVALUATION_COMPLETED event",
        );

        // 1. Mark evidence as verified if percentageScore >= 70
        const submissionEvidence = await this.evidenceService.listSubmissionEvidence(
          payload.submissionId,
        );
        for (const ev of submissionEvidence) {
          const newStatus = payload.isPassed
            ? EvidenceVerificationStatus.VERIFIED
            : EvidenceVerificationStatus.NEEDS_REVIEW;
          await this.evidenceService.verifyEvidence(
            {
              evidenceId: ev.id,
              status: newStatus,
              qualityScore: payload.percentageScore,
              reviewNotes: `AI Evaluation completed. Score: ${payload.percentageScore}%`,
            },
            "system-ai",
          );
        }

        // 2. Advance candidate journey to AI_EVALUATED
        const journeys = await this.journeyRepo.listByCandidate(payload.candidateId);
        const activeJourney = journeys.find(
          (j) =>
            j.status === CandidateJourneyStatus.ASSESSMENT_SUBMITTED ||
            j.status === CandidateJourneyStatus.ASSESSMENT_STARTED ||
            j.assessmentId === payload.assessmentId,
        );

        if (activeJourney) {
          await this.journeyService.advanceJourney(
            {
              journeyId: activeJourney.id,
              toStatus: CandidateJourneyStatus.AI_EVALUATED,
              overallScore: payload.percentageScore,
              reason: `Automated transition on AI evaluation completion (Score: ${payload.percentageScore}%)`,
            },
            "system-ai",
          );
        }
      } catch (err) {
        log.error({ err, payload }, "Failed to process EVALUATION_COMPLETED automation");
      }
    });
  }
}
