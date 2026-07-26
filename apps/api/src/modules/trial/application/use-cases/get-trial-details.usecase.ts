import { createModuleLogger } from '@/core/logger.js';

import { TrialNotFoundError, TrialNotPublishedError } from '../../domain/errors/trial.errors.js';

import type { Trial } from '../../domain/entities/Trial.entity.js';
import type { ITrialRepository } from '../ports/ITrialRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';

const log = createModuleLogger('GetTrialDetailsUseCase');

export class GetTrialDetailsUseCase {
  constructor(
    private readonly trialRepository: ITrialRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(identifier: string, requestingUserId?: string): Promise<Trial | ReturnType<Trial['toPublicCandidateView']>> {
    log.info({ identifier, requestingUserId }, 'Fetching assessment trial details');

    const trial = await this.trialRepository.findByIdOrSlug(identifier);
    if (!trial) {
      throw new TrialNotFoundError(identifier);
    }

    if (requestingUserId) {
      const userCompany = await this.companyRepository.findByUserId(requestingUserId);
      if (userCompany && userCompany.id === trial.companyId) {
        log.info({ trialId: trial.id }, 'Returning full unmasked trial to owning company member');
        return trial;
      }
    }

    if (!trial.isPublished()) {
      throw new TrialNotPublishedError(identifier);
    }

    log.info({ trialId: trial.id }, 'Returning candidate-safe view of published trial');
    return trial.toPublicCandidateView();
  }
}
