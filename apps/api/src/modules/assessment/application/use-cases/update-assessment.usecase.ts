import { createModuleLogger } from '@/core/logger.js';
import { CompanyNotFoundError, NotCompanyOwnerError } from '@/modules/company/domain/errors/company.errors.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { AssessmentNotFoundError } from '../../domain/errors/assessment.errors.js';

import type { Assessment } from '../../domain/entities/Assessment.entity.js';
import type { IAssessmentRepository, UpdateAssessmentData } from '../ports/IAssessmentRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';

const log = createModuleLogger('UpdateAssessmentUseCase');

export class UpdateAssessmentUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(userId: string, assessmentId: string, input: UpdateAssessmentData): Promise<Assessment> {
    log.info({ userId, assessmentId }, 'Attempting to update assessment assessment');

    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new CompanyNotFoundError();
    }

    const assessment = await this.assessmentRepository.findById(assessmentId);
    if (!assessment || assessment.companyId !== company.id) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    if (input.tasks) {
      assessment.validateCanBeModified();
    }

    const updated = await this.assessmentRepository.update(assessment.id, input);
    log.info({ assessmentId: updated.id }, 'Assessment updated successfully');

    await eventBus.emit(DOMAIN_EVENTS.ASSESSMENT_UPDATED, {
      assessmentId: updated.id,
      companyId: company.id,
      updatedBy: userId,
    });

    return updated;
  }
}
