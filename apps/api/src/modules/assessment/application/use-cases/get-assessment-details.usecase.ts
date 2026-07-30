import { createModuleLogger } from '@/core/logger.js';

import { AssessmentNotFoundError, AssessmentNotPublishedError } from '../../domain/errors/assessment.errors.js';

import type { Assessment } from '../../domain/entities/Assessment.entity.js';
import type { IAssessmentRepository } from '../ports/IAssessmentRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';

const log = createModuleLogger('GetAssessmentDetailsUseCase');

export class GetAssessmentDetailsUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(identifier: string, requestingUserId?: string): Promise<Assessment | ReturnType<Assessment['toPublicCandidateView']>> {
    log.info({ identifier, requestingUserId }, 'Fetching assessment assessment details');

    const assessment = await this.assessmentRepository.findByIdOrSlug(identifier);
    if (!assessment) {
      throw new AssessmentNotFoundError(identifier);
    }

    if (requestingUserId) {
      const userCompany = await this.companyRepository.findByUserId(requestingUserId);
      if (userCompany && userCompany.id === assessment.companyId) {
        log.info({ assessmentId: assessment.id }, 'Returning full unmasked assessment to owning company member');
        return assessment;
      }
    }

    if (!assessment.isPublished()) {
      throw new AssessmentNotPublishedError(identifier);
    }

    log.info({ assessmentId: assessment.id }, 'Returning candidate-safe view of published assessment');
    return assessment.toPublicCandidateView();
  }
}
