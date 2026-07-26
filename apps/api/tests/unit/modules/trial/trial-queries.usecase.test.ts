import { TrialStatus, TaskType } from '@microintern/database';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GetTrialDetailsUseCase } from '@/modules/trial/application/use-cases/get-trial-details.usecase.js';
import { ListPublicTrialsUseCase } from '@/modules/trial/application/use-cases/list-public-trials.usecase.js';
import { Trial } from '@/modules/trial/domain/entities/Trial.entity.js';
import { TrialTask } from '@/modules/trial/domain/entities/TrialTask.entity.js';
import { TrialNotPublishedError } from '@/modules/trial/domain/errors/trial.errors.js';

describe('Trial Query & Directory Use Cases', () => {
  let mockTrialRepo: any;
  let mockCompanyRepo: any;

  const testTask = new TrialTask(
    't-1',
    'trial-20',
    1,
    'Algorithm challenge',
    'Solve two-sum problem',
    TaskType.CODE_SUBMISSION,
    true,
    100,
    { language: 'python', answerKey: 'def twoSum(): return [0,1]', privateRubric: 'Check O(N) complexity' },
    new Date(),
    new Date()
  );

  const testTrial = (status: TrialStatus = TrialStatus.PUBLISHED) =>
    new Trial(
      'trial-20',
      'comp-1',
      'user-owner',
      status,
      'Python Data Structures Assessment',
      'python-data-structures',
      'Algorithm assessment.',
      'Complete in 60 mins.',
      ['Python'],
      'Software Engineer',
      null,
      60,
      70,
      1,
      true,
      status === TrialStatus.PUBLISHED ? new Date() : null,
      null,
      new Date(),
      new Date(),
      [testTask]
    );

  beforeEach(() => {
    mockTrialRepo = {
      findByIdOrSlug: vi.fn(),
      listPublicTrials: vi.fn(),
    };
    mockCompanyRepo = {
      findByUserId: vi.fn(),
    };
  });

  describe('GetTrialDetailsUseCase', () => {
    it('should return masked candidate view when queried by an external candidate or public observer', async () => {
      const useCase = new GetTrialDetailsUseCase(mockTrialRepo, mockCompanyRepo);
      mockTrialRepo.findByIdOrSlug.mockResolvedValue(testTrial(TrialStatus.PUBLISHED));
      mockCompanyRepo.findByUserId.mockResolvedValue(null); // External candidate

      const res = await useCase.execute('python-data-structures', 'candidate-user');
      expect((res as any).tasks[0].config.language).toBe('python');
      expect((res as any).tasks[0].config.answerKey).toBeUndefined();
    });

    it('should return unmasked evaluation answer key when queried by recruiter/owner of the owning company', async () => {
      const useCase = new GetTrialDetailsUseCase(mockTrialRepo, mockCompanyRepo);
      mockTrialRepo.findByIdOrSlug.mockResolvedValue(testTrial(TrialStatus.PUBLISHED));
      mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-1' }); // Owning company member

      const res = await useCase.execute('python-data-structures', 'recruiter-user');
      expect((res as any).tasks[0].config.answerKey).toBe('def twoSum(): return [0,1]');
    });

    it('should throw TrialNotPublishedError if an external user requests details for a DRAFT trial', async () => {
      const useCase = new GetTrialDetailsUseCase(mockTrialRepo, mockCompanyRepo);
      mockTrialRepo.findByIdOrSlug.mockResolvedValue(testTrial(TrialStatus.DRAFT));
      mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'other-comp-999' });

      await expect(useCase.execute('trial-20', 'stranger')).rejects.toThrow(TrialNotPublishedError);
    });
  });

  describe('ListPublicTrialsUseCase', () => {
    it('should format public candidate views and build proper pagination metadata', async () => {
      const useCase = new ListPublicTrialsUseCase(mockTrialRepo);
      mockTrialRepo.listPublicTrials.mockResolvedValue({
        trials: [testTrial(), testTrial()],
        total: 14,
      });

      const res = await useCase.execute({ page: 2, limit: 10 });
      expect(res.trials).toHaveLength(2);
      expect(res.trials[0].tasks[0].config.answerKey).toBeUndefined();
      expect(res.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 14,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });
  });
});
