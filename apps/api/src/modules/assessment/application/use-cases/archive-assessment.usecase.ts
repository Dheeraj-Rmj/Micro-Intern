import { createModuleLogger } from '@/core/logger.js';
import { AssessmentNotFoundError } from '../../domain/errors/assessment.errors.js';
import type { Assessment } from '../../domain/entities/Assessment.entity.js';
import type { IAssessmentRepository } from '../ports/IAssessmentRepository.js';

const log = createModuleLogger('ArchiveAssessmentUseCase');

export class ArchiveAssessmentUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(assessmentId: string, recruiterId: string): Promise<Assessment> {
    const existing = await this.assessmentRepository.findById(assessmentId);
    if (!existing) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    log.info({ assessmentId, recruiterId }, 'Archiving assessment');
    const archived = await this.assessmentRepository.archive(assessmentId);

    // Snapshot archive transition
    await this.assessmentRepository.createVersion(
      archived.id,
      999,
      archived,
      'Assessment archived',
      recruiterId
    );

    return archived;
  }
}
