import { TrialStatus } from '@microintern/database';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CompanyNotFoundError } from '@/modules/company/domain/errors/company.errors.js';
import { CreateTrialUseCase } from '@/modules/trial/application/use-cases/create-trial.usecase.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

describe('CreateTrialUseCase', () => {
  let useCase: CreateTrialUseCase;
  let mockTrialRepo: any;
  let mockCompanyRepo: any;

  beforeEach(() => {
    mockTrialRepo = {
      findBySlug: vi.fn(),
      create: vi.fn().mockImplementation(async (data) => ({
        id: 'trial-new',
        ...data,
        status: TrialStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };

    mockCompanyRepo = {
      findByUserId: vi.fn(),
    };

    useCase = new CreateTrialUseCase(mockTrialRepo, mockCompanyRepo);
    vi.spyOn(eventBus, 'emit').mockResolvedValue(undefined);
  });

  it('should throw CompanyNotFoundError if requesting user is not linked to any company', async () => {
    mockCompanyRepo.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute('user-unlinked', {
        title: 'New Trial',
        description: 'Testing description',
        instructions: 'Test instructions',
        durationMinutes: 60,
      })
    ).rejects.toThrow(CompanyNotFoundError);
  });

  it('should format URL slug cleanly, create DRAFT trial, and emit TRIAL_CREATED event', async () => {
    mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-1', name: 'MicroIntern AI' });
    mockTrialRepo.findBySlug.mockResolvedValue(null);

    const result = await useCase.execute('user-owner', {
      title: '  Senior Backend Architecture Evaluation  ',
      description: 'System design and Node.js testing.',
      instructions: 'Complete within 90 minutes.',
      durationMinutes: 90,
      passingScore: 80,
    });

    expect(result.id).toBe('trial-new');
    expect(result.slug).toBe('senior-backend-architecture-evaluation');
    expect(result.status).toBe(TrialStatus.DRAFT);
    expect(mockTrialRepo.create).toHaveBeenCalled();
    expect(eventBus.emit).toHaveBeenCalledWith(DOMAIN_EVENTS.TRIAL_CREATED, {
      trialId: 'trial-new',
      companyId: 'comp-1',
      title: 'Senior Backend Architecture Evaluation',
      slug: 'senior-backend-architecture-evaluation',
      createdById: 'user-owner',
    });
  });
});
