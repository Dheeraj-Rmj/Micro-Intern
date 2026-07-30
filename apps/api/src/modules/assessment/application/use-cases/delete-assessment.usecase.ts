import { createModuleLogger } from "@/core/logger.js";
import { AssessmentNotFoundError } from "../../domain/errors/assessment.errors.js";
import type { IAssessmentRepository } from "../ports/IAssessmentRepository.js";

const log = createModuleLogger("DeleteAssessmentUseCase");

export class DeleteAssessmentUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(assessmentId: string, deletedBy: string): Promise<void> {
    const existing = await this.assessmentRepository.findById(assessmentId);
    if (!existing) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    log.info({ assessmentId, deletedBy }, "Soft-deleting assessment");
    await this.assessmentRepository.delete(assessmentId, deletedBy);
  }
}
