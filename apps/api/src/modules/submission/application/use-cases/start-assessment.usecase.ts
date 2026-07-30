import { SubmissionStatus } from "@microintern/database";

import { createModuleLogger } from "@/core/logger.js";
import {
  AssessmentNotFoundError,
  AssessmentNotPublishedError,
} from "@/modules/assessment/domain/errors/assessment.errors.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

import {
  MaxAttemptsExceededError,
  CandidateProfileNotFoundError,
} from "../../domain/errors/submission.errors.js";

import type { Submission } from "../../domain/entities/Submission.entity.js";
import type { ISubmissionRepository } from "../ports/ISubmissionRepository.js";
import type { GetProfileUseCase } from "@/modules/candidate/application/use-cases/get-profile.usecase.js";
import type { IAssessmentRepository } from "@/modules/assessment/application/ports/IAssessmentRepository.js";

const log = createModuleLogger("StartAssessmentUseCase");

export class StartAssessmentUseCase {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  async execute(userId: string, assessmentId: string): Promise<Submission> {
    log.info({ userId, assessmentId }, "Initiating skill assessment assessment session");

    const profile = await this.getProfileUseCase.execute(userId);
    if (!profile) {
      throw new CandidateProfileNotFoundError(userId);
    }

    const assessment = await this.assessmentRepository.findByIdOrSlug(assessmentId);
    if (!assessment) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    if (!assessment.isPublished()) {
      throw new AssessmentNotPublishedError(assessmentId);
    }

    // Check if candidate already has an active session IN_PROGRESS
    const activeSubmission = await this.submissionRepository.findActiveByCandidateAndAssessment(
      profile.id,
      assessment.id,
    );
    if (activeSubmission && activeSubmission.status === SubmissionStatus.IN_PROGRESS) {
      log.info(
        { submissionId: activeSubmission.id },
        "Resuming existing active assessment session",
      );
      return activeSubmission;
    }

    const attempts = await this.submissionRepository.countAttempts(profile.id, assessment.id);
    if (attempts >= assessment.maxAttempts) {
      throw new MaxAttemptsExceededError(assessment.id, assessment.maxAttempts);
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + assessment.durationMinutes * 60 * 1000);

    const submission = await this.submissionRepository.create({
      assessmentId: assessment.id,
      candidateId: profile.id,
      status: SubmissionStatus.IN_PROGRESS,
      attemptNumber: attempts + 1,
      startedAt,
      expiresAt,
    });

    log.info(
      { submissionId: submission.id, attemptNumber: submission.attemptNumber, expiresAt },
      "Assessment session successfully started",
    );

    await eventBus.emit(DOMAIN_EVENTS.ASSESSMENT_STARTED, {
      submissionId: submission.id,
      assessmentId: assessment.id,
      candidateId: profile.id,
      startedAt,
      expiresAt,
    });

    return submission;
  }
}
