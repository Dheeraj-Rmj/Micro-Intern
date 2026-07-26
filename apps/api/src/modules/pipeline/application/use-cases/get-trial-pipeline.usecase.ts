import { createModuleLogger } from '@/core/logger.js';
import { CompanyNotFoundError } from '@/modules/company/domain/errors/company.errors.js';
import { TrialNotFoundError } from '@/modules/trial/domain/errors/trial.errors.js';
import { ForbiddenError } from '@/shared/errors/AppError.js';

import type { Pipeline } from '../../domain/entities/Pipeline.entity.js';
import type { IPipelineRepository } from '../ports/IPipelineRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';
import type { ITrialRepository } from '@/modules/trial/application/ports/ITrialRepository.js';

const log = createModuleLogger('GetTrialPipelineUseCase');

export class GetTrialPipelineUseCase {
  constructor(
    private readonly pipelineRepository: IPipelineRepository,
    private readonly trialRepository: ITrialRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(userId: string, trialId: string): Promise<Pipeline> {
    log.info({ userId, trialId }, 'Fetching pipeline directory and candidate board for trial');

    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new CompanyNotFoundError();
    }

    const trial = await this.trialRepository.findById(trialId);
    if (!trial) {
      throw new TrialNotFoundError(trialId);
    }

    if (trial.companyId !== company.id) {
      throw new ForbiddenError('You do not have authorization to view the pipeline for this assessment trial.');
    }

    let pipeline = await this.pipelineRepository.findByTrialId(trialId);
    if (!pipeline) {
      log.info({ trialId, companyId: company.id }, 'Initializing default recruitment pipeline for trial');
      pipeline = await this.pipelineRepository.createDefaultPipeline(
        company.id,
        trial.id,
        `${trial.title} Pipeline`,
        trial.roleTitle || trial.title
      );
    }

    return pipeline;
  }
}
