import { getContainer } from '@/core/container.js';
import { createModuleLogger } from '@/core/logger.js';
import { PrismaTrialRepository } from '@/modules/trial/infrastructure/repositories/PrismaTrialRepository.js';
import { DOMAIN_EVENTS, eventBus, type DomainEvent } from '@/shared/events/EventBus.js';

import { AutoEnrollCandidateUseCase } from '../../application/use-cases/auto-enroll-candidate.usecase.js';
import { PrismaPipelineRepository } from '../repositories/PrismaPipelineRepository.js';

const log = createModuleLogger('PipelineEventListeners');

interface TrialSubmittedPayload {
  submissionId: string;
  candidateId: string;
  trialId: string;
}

export function registerPipelineEventListeners(): () => void {
  log.info('Registering Pipeline domain event subscribers');

  const container = getContainer() as any;
  const db = container.infra?.db;
  if (!db) {
    log.warn('Database instance not initialized in container during pipeline listener registration');
    return () => {};
  }

  const pipelineRepository = new PrismaPipelineRepository(db);
  const trialRepository = new PrismaTrialRepository(db);
  const autoEnrollUseCase = new AutoEnrollCandidateUseCase(pipelineRepository, trialRepository);

  return eventBus.on(
    DOMAIN_EVENTS.TRIAL_SUBMITTED,
    async (event: DomainEvent<unknown>) => {
      const payload = event.payload as TrialSubmittedPayload;
      log.info({ trialId: payload.trialId, candidateId: payload.candidateId }, 'Received TRIAL_SUBMITTED event in Pipeline module');
      try {
        await autoEnrollUseCase.execute({
          submissionId: payload.submissionId,
          candidateId: payload.candidateId,
          trialId: payload.trialId,
        });
      } catch (err) {
        log.error({ err, payload }, 'Failed to auto-enroll candidate into recruitment pipeline');
      }
    }
  );
}
