import { createModuleLogger } from '@/core/logger.js';
import { AssessmentNotFoundError } from '../../domain/errors/assessment.errors.js';
import type { Assessment } from '../../domain/entities/Assessment.entity.js';
import type { IAssessmentRepository } from '../ports/IAssessmentRepository.js';

const log = createModuleLogger('DuplicateAssessmentUseCase');

export class DuplicateAssessmentUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(assessmentId: string, recruiterId: string): Promise<Assessment> {
    const existing = await this.assessmentRepository.findById(assessmentId);
    if (!existing) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    const newSlug = `${existing.slug}-copy-${Date.now().toString(36)}`;
    log.info({ assessmentId, recruiterId, newSlug }, 'Duplicating assessment');

    const duplicated = await this.assessmentRepository.duplicate(assessmentId, newSlug, recruiterId);

    // Create initial version snapshot for the duplicate
    await this.assessmentRepository.createVersion(
      duplicated.id,
      1,
      duplicated,
      `Duplicated from assessment ${existing.title}`,
      recruiterId
    );

    return duplicated;
  }
}
