import { TrialStatus, TaskType } from '@microintern/database';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PublishTrialUseCase } from '@/modules/trial/application/use-cases/publish-trial.usecase.js';
import { Trial } from '@/modules/trial/domain/entities/Trial.entity.js';
import { TrialTask } from '@/modules/trial/domain/entities/TrialTask.entity.js';
import { TrialCannotPublishWithoutTasksError, TrialNotFoundError } from '@/modules/trial/domain/errors/trial.errors.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

describe('PublishTrialUseCase', () => {
  let useCase: PublishTrialUseCase;
  let mockTrialRepo: any;
  let mockCompanyRepo: any;

  const buildTrial = (tasks: TrialTask[] = []) =>
    new Trial(
      'trial-10',
      'comp-1',
      'user-owner',
      TrialStatus.DRAFT,
      'Full-Stack Developer Assessment',
      'full-stack-developer-assessment',
      'Comprehensive trial.',
      'Complete all tasks.',
      ['React', 'Node.js'],
      'Full Stack Dev',
      null,
      120,
      70,
      1,
      true,
      null,
      null,
      new Date(),
      new Date(),
      tasks
    );

  const sampleTask = new TrialTask(
    't-1',
    'trial-10',
    1,
    'Task 1',
    'Desc',
    TaskType.SHORT_ANSWER,
    true,
    100,
    {},
    new Date(),
    new Date()
  );

  beforeEach(() => {
    mockTrialRepo = {
      findById: vi.fn(),
      publish: vi.fn().mockImplementation(async (id, publishedAt) => {
        const t = buildTrial([sampleTask]);
        return new Trial(t.id, t.companyId, t.createdById, TrialStatus.PUBLISHED, t.title, t.slug, t.description, t.instructions, t.skillsRequired, t.roleTitle, t.level, t.durationMinutes, t.passingScore, t.maxAttempts, t.isPublic, publishedAt, null, t.createdAt, new Date(), t.tasks);
      }),
    };
    mockCompanyRepo = {
      findByUserId: vi.fn().mockResolvedValue({ id: 'comp-1' }),
    };
    useCase = new PublishTrialUseCase(mockTrialRepo, mockCompanyRepo);
    vi.spyOn(eventBus, 'emit').mockResolvedValue(undefined);
  });

  it('should reject publishing attempt with TrialCannotPublishWithoutTasksError when trial has zero tasks', async () => {
    mockTrialRepo.findById.mockResolvedValue(buildTrial([]));
    await expect(useCase.execute('user-owner', 'trial-10')).rejects.toThrow(TrialCannotPublishWithoutTasksError);
    expect(mockTrialRepo.publish).not.toHaveBeenCalled();
  });

  it('should publish trial and emit TRIAL_PUBLISHED event when valid tasks exist', async () => {
    mockTrialRepo.findById.mockResolvedValue(buildTrial([sampleTask]));
    const result = await useCase.execute('user-owner', 'trial-10');
    expect(result.status).toBe(TrialStatus.PUBLISHED);
    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(mockTrialRepo.publish).toHaveBeenCalled();
    expect(eventBus.emit).toHaveBeenCalledWith(
      DOMAIN_EVENTS.TRIAL_PUBLISHED,
      expect.objectContaining({ trialId: 'trial-10', companyId: 'comp-1' })
    );
  });
});
