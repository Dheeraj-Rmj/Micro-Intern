import { createModuleLogger } from '@/core/logger.js';
import { buildPaginationMeta, toPrismaPage } from '@/shared/response/ResponseFormatter.js';

import { CandidateProfileNotFoundError } from '../../domain/errors/submission.errors.js';

import type { Submission } from '../../domain/entities/Submission.entity.js';
import type { ISubmissionRepository } from '../ports/ISubmissionRepository.js';
import type { GetProfileUseCase } from '@/modules/candidate/application/use-cases/get-profile.usecase.js';
import type { PaginationMeta } from '@microintern/shared';

const log = createModuleLogger('ListCandidateSubmissionsUseCase');

export class ListCandidateSubmissionsUseCase {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly getProfileUseCase: GetProfileUseCase
  ) {}

  async execute(
    userId: string,
    query: { page?: number; limit?: number }
  ): Promise<{ submissions: Submission[]; pagination: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    log.info({ userId, page, limit }, 'Listing candidate assessment submissions');

    const profile = await this.getProfileUseCase.execute(userId);
    if (!profile) {
      throw new CandidateProfileNotFoundError(userId);
    }

    const paginationInput = toPrismaPage(page, limit);
    const { submissions, total } = await this.submissionRepository.listByCandidate(profile.id, paginationInput);

    const pagination = buildPaginationMeta({ page, limit, total });
    return { submissions, pagination };
  }
}
