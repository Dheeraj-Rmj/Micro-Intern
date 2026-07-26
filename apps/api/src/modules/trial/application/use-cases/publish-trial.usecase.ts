import { createModuleLogger } from '@/core/logger.js';
import { CompanyNotFoundError } from '@/modules/company/domain/errors/company.errors.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { TrialNotFoundError } from '../../domain/errors/trial.errors.js';

import type { Trial } from '../../domain/entities/Trial.entity.js';
import type { ITrialRepository } from '../ports/ITrialRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';

const log = createModuleLogger('PublishTrialUseCase');

export class PublishTrialUseCase {
  constructor(
    private readonly trialRepository: ITrialRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(userId: string, trialId: string): Promise<Trial> {
    log.info({ userId, trialId }, 'Attempting to publish assessment trial');

    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new CompanyNotFoundError();
    }

    const trial = await this.trialRepository.findById(trialId);
    if (!trial || trial.companyId !== company.id) {
      throw new TrialNotFoundError(trialId);
    }

    trial.validateCanPublish();

    const publishedAt = new Date();
    const published = await this.trialRepository.publish(trial.id, publishedAt);
    log.info({ trialId: published.id, publishedAt }, 'Trial published successfully');

    await eventBus.emit(DOMAIN_EVENTS.TRIAL_PUBLISHED, {
      trialId: published.id,
      companyId: company.id,
      title: published.title,
      publishedAt,
    });

    return published;
  }
}
