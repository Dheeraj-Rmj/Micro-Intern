import { createModuleLogger } from '@/core/logger.js';
import { CompanyNotFoundError } from '@/modules/company/domain/errors/company.errors.js';
import { ForbiddenError } from '@/shared/errors/AppError.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { PipelineNotFoundError, PipelineEntryNotFoundError, PipelineStageNotFoundError } from '../../domain/errors/pipeline.errors.js';


import type { PipelineEntry } from '../../domain/entities/PipelineEntry.entity.js';
import type { IPipelineRepository } from '../ports/IPipelineRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';

const log = createModuleLogger('RejectCandidateUseCase');

export class RejectCandidateUseCase {
  constructor(
    private readonly pipelineRepository: IPipelineRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(
    userId: string,
    entryId: string,
    reason?: string
  ): Promise<PipelineEntry> {
    log.info({ userId, entryId, reason }, 'Marking candidate as rejected in pipeline');

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
      throw new ForbiddenError('You do not have authorization to reject candidates in this pipeline.');
    }

    const rejectedStage = pipeline.getRejectedStage();
    if (!rejectedStage) {
      throw new PipelineStageNotFoundError('No REJECTED stage configured in this trial pipeline.');
    }

    entry.validateCanMoveTo(rejectedStage);

    const updatedEntry = await this.pipelineRepository.updateEntry(entryId, {
      stageId: rejectedStage.id,
      movedBy: userId,
      ...(reason !== undefined && { notes: reason }),
    });

    void eventBus.emit(DOMAIN_EVENTS.PIPELINE_CANDIDATE_MOVED, {
      entryId,
      pipelineId: pipeline.id,
      candidateUserId: entry.userId,
      fromStageId: entry.stageId,
      toStageId: rejectedStage.id,
      stageName: rejectedStage.name,
      stageType: rejectedStage.stageType,
      movedBy: userId,
      isRejected: true,
      reason,
      timestamp: new Date(),
    });

    return updatedEntry;
  }
}
