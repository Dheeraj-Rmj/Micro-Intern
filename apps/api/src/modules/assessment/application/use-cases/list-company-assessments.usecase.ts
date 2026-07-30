import { createModuleLogger } from '@/core/logger.js';
import { CompanyNotFoundError } from '@/modules/company/domain/errors/company.errors.js';
import { buildPaginationMeta, toPrismaPage } from '@/shared/response/ResponseFormatter.js';

import type { Assessment } from '../../domain/entities/Assessment.entity.js';
import type { IAssessmentRepository } from '../ports/IAssessmentRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';
import type { PaginationMeta } from '@microintern/shared';
import type { AssessmentStatus } from '@microintern/database';

const log = createModuleLogger('ListCompanyAssessmentsUseCase');

export class ListCompanyAssessmentsUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(
    userId: string,
    query: { status?: AssessmentStatus; page?: number; limit?: number }
  ): Promise<{ assessments: Assessment[]; pagination: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    log.info({ userId, page, limit, status: query.status }, 'Listing company assessment assessments');

    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new CompanyNotFoundError();
    }

    const paginationInput = toPrismaPage(page, limit);
    const { assessments, total } = await this.assessmentRepository.listCompanyAssessments(company.id, {
      status: query.status,
      ...paginationInput,
    });

    const pagination = buildPaginationMeta({ page, limit, total });
    return { assessments, pagination };
  }
}
