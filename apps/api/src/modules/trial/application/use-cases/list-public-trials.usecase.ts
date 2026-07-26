import { createModuleLogger } from '@/core/logger.js';
import { buildPaginationMeta, toPrismaPage } from '@/shared/response/ResponseFormatter.js';

import type { ITrialRepository } from '../ports/ITrialRepository.js';
import type { ExperienceLevel } from '@microintern/database';
import type { PaginationMeta } from '@microintern/shared';

const log = createModuleLogger('ListPublicTrialsUseCase');

export class ListPublicTrialsUseCase {
  constructor(private readonly trialRepository: ITrialRepository) {}

  async execute(query: {
    skill?: string;
    level?: ExperienceLevel;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ trials: Array<ReturnType<any>>; pagination: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    log.info({ page, limit, query }, 'Listing open marketplace assessment trials');

    const paginationInput = toPrismaPage(page, limit);
    const { trials, total } = await this.trialRepository.listPublicTrials({
      skill: query.skill,
      level: query.level,
      search: query.search,
      ...paginationInput,
    });

    const publicTrials = trials.map((t) => t.toPublicCandidateView());
    const pagination = buildPaginationMeta({ page, limit, total });

    return { trials: publicTrials, pagination };
  }
}
