import { createModuleLogger } from '@/core/logger.js';

import type { PipelineEntry } from '../../domain/entities/PipelineEntry.entity.js';
import type { IPipelineRepository } from '../ports/IPipelineRepository.js';
import type { ITrialRepository } from '@/modules/trial/application/ports/ITrialRepository.js';

const log = createModuleLogger('AutoEnrollCandidateUseCase');

export class AutoEnrollCandidateUseCase {
  constructor(
    private readonly pipelineRepository: IPipelineRepository,
    private readonly trialRepository: ITrialRepository
  ) {}

  async execute(input: { submissionId: string; candidateId: string; trialId: string }): Promise<PipelineEntry | null> {
    const { submissionId, candidateId, trialId } = input;
    log.info({ submissionId, candidateId, trialId }, 'Auto-enrolling submitting candidate into evaluation pipeline');

    const trial = await this.trialRepository.findById(trialId);
    if (!trial) {
      log.warn({ trialId }, 'Cannot enroll candidate into pipeline: Trial not found');
      return null;
    }

    let pipeline = await this.pipelineRepository.findByTrialId(trialId);
    if (!pipeline) {
      log.info({ trialId, companyId: trial.companyId }, 'Initializing default recruitment pipeline upon first submission');
      pipeline = await this.pipelineRepository.createDefaultPipeline(
        trial.companyId,
        trial.id,
        `${trial.title} Pipeline`,
        trial.roleTitle || trial.title
      );
    }

    const existing = await this.pipelineRepository.findEntryByPipelineAndUser(pipeline.id, candidateId);
    if (existing) {
      log.info({ candidateId, pipelineId: pipeline.id }, 'Candidate already present in pipeline board');
      return existing;
    }

    const initialStage = pipeline.getInitialStage();
    const entry = await this.pipelineRepository.createEntry({
      pipelineId: pipeline.id,
      stageId: initialStage.id,
      userId: candidateId,
      notes: `Auto-enrolled via trial submission (${submissionId})`,
    });

    log.info({ entryId: entry.id, stageId: initialStage.id }, 'Successfully enrolled candidate into initial pipeline stage');
    return entry;
  }
}
