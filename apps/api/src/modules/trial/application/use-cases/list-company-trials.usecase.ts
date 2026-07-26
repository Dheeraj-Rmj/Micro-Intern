import { createModuleLogger } from '@/core/logger.js';
import { CompanyNotFoundError } from '@/modules/company/domain/errors/company.errors.js';
import { buildPaginationMeta, toPrismaPage } from '@/shared/response/ResponseFormatter.js';

import type { Trial } from '../../domain/entities/Trial.entity.js';
import type { ITrialRepository } from '../ports/ITrialRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';
import type { PaginationMeta, TrialStatus } from '@microintern/shared';

const log = createModuleLogger('ListCompanyTrialsUseCase');

export class ListCompanyTrialsUseCase {
  constructor(
    private readonly trialRepository: ITrialRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(
    userId: string,
    query: { status?: TrialStatus; page?: number; limit?: number }
  ): Promise<{ trials: Trial[]; pagination: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    log.info({ userId, page, limit, status: query.status }, 'Listing company assessment trials');

    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new CompanyNotFoundError();
    }

    const paginationInput = toPrismaPage(page, limit);
    const { trials, total } = await this.trialRepository.listCompanyTrials(company.id, {
      status: query.status,
      ...paginationInput,
    });

    const pagination = buildPaginationMeta({ page, limit, total });
    return { trials, pagination };
  }
}
