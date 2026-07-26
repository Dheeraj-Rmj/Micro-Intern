import { createModuleLogger } from '@/core/logger.js';
import { CompanyNotFoundError, NotCompanyOwnerError } from '@/modules/company/domain/errors/company.errors.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { TrialNotFoundError } from '../../domain/errors/trial.errors.js';

import type { Trial } from '../../domain/entities/Trial.entity.js';
import type { ITrialRepository, UpdateTrialData } from '../ports/ITrialRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';

const log = createModuleLogger('UpdateTrialUseCase');

export class UpdateTrialUseCase {
  constructor(
    private readonly trialRepository: ITrialRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(userId: string, trialId: string, input: UpdateTrialData): Promise<Trial> {
    log.info({ userId, trialId }, 'Attempting to update assessment trial');

    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new CompanyNotFoundError();
    }

    const trial = await this.trialRepository.findById(trialId);
    if (!trial || trial.companyId !== company.id) {
      throw new TrialNotFoundError(trialId);
    }

    if (input.tasks) {
      trial.validateCanBeModified();
    }

    const updated = await this.trialRepository.update(trial.id, input);
    log.info({ trialId: updated.id }, 'Trial updated successfully');

    await eventBus.emit(DOMAIN_EVENTS.TRIAL_UPDATED, {
      trialId: updated.id,
      companyId: company.id,
      updatedBy: userId,
    });

    return updated;
  }
}
