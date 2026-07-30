import { createModuleLogger } from '@/core/logger.js';
import { CompanyNotFoundError } from '@/modules/company/domain/errors/company.errors.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { AssessmentNotFoundError } from '../../domain/errors/assessment.errors.js';

import type { Assessment } from '../../domain/entities/Assessment.entity.js';
import type { IAssessmentRepository } from '../ports/IAssessmentRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';

const log = createModuleLogger('PublishAssessmentUseCase');

export class PublishAssessmentUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(userId: string, assessmentId: string): Promise<Assessment> {
    log.info({ userId, assessmentId }, 'Attempting to publish assessment assessment');

    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new CompanyNotFoundError();
    }

    const assessment = await this.assessmentRepository.findById(assessmentId);
    if (!assessment || assessment.companyId !== company.id) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    assessment.validateCanPublish();

    const publishedAt = new Date();
    const published = await this.assessmentRepository.publish(assessment.id, publishedAt);
    log.info({ assessmentId: published.id, publishedAt }, 'Assessment published successfully');

    await eventBus.emit(DOMAIN_EVENTS.ASSESSMENT_PUBLISHED, {
      assessmentId: published.id,
      companyId: company.id,
      title: published.title,
      publishedAt,
    });

    return published;
  }
}
