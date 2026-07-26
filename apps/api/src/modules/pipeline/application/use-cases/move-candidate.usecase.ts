import { createModuleLogger } from '@/core/logger.js';
import { CompanyNotFoundError } from '@/modules/company/domain/errors/company.errors.js';
import { ForbiddenError } from '@/shared/errors/AppError.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { PipelineNotFoundError, PipelineEntryNotFoundError } from '../../domain/errors/pipeline.errors.js';


import type { PipelineEntry } from '../../domain/entities/PipelineEntry.entity.js';
import type { IPipelineRepository } from '../ports/IPipelineRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';

const log = createModuleLogger('MoveCandidateUseCase');

export class MoveCandidateUseCase {
  constructor(
    private readonly pipelineRepository: IPipelineRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(
    userId: string,
    entryId: string,
    input: { targetStageId: string; notes?: string }
  ): Promise<PipelineEntry> {
    log.info({ userId, entryId, targetStageId: input.targetStageId }, 'Moving candidate between pipeline stages');

    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new CompanyNotFoundError();
    }

    const entry = await this.pipelineRepository.findEntryById(entryId);
    if (!entry) {
      throw new PipelineEntryNotFoundError(entryId);
    }

    const pipeline = await this.pipelineRepository.findById(entry.pipelineId);
    if (!pipeline) {
      throw new PipelineNotFoundError(entry.pipelineId);
    }

    if (pipeline.companyId !== company.id) {
      throw new ForbiddenError('You do not have authorization to alter candidate placement in this pipeline.');
    }

    const targetStage = pipeline.findStageById(input.targetStageId);
    entry.validateCanMoveTo(targetStage);

    const updatedEntry = await this.pipelineRepository.updateEntry(entryId, {
      stageId: targetStage.id,
      movedBy: userId,
      ...(input.notes !== undefined && { notes: input.notes }),
    });

    eventBus.emit(DOMAIN_EVENTS.PIPELINE_CANDIDATE_MOVED, {
      entryId,
      pipelineId: pipeline.id,
      candidateUserId: entry.userId,
      fromStageId: entry.stageId,
      toStageId: targetStage.id,
      stageName: targetStage.name,
      stageType: targetStage.stageType,
      movedBy: userId,
      timestamp: new Date(),
    });

    return updatedEntry;
  }
}
