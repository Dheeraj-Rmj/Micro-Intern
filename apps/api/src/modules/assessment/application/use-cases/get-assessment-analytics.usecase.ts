import { createModuleLogger } from '@/core/logger.js';
import { AssessmentNotFoundError } from '../../domain/errors/assessment.errors.js';
import type { IAssessmentRepository, AssessmentAnalytics } from '../ports/IAssessmentRepository.js';

const log = createModuleLogger('GetAssessmentAnalyticsUseCase');

export class GetAssessmentAnalyticsUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(assessmentId: string): Promise<AssessmentAnalytics> {
    const assessment = await this.assessmentRepository.findById(assessmentId);
    if (!assessment) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    log.info({ assessmentId }, 'Fetching assessment analytics metrics');
    return await this.assessmentRepository.getAnalytics(assessmentId);
  }
}
