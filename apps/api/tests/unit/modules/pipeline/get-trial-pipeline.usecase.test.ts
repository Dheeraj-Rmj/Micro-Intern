import { PipelineStageType } from '@microintern/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CompanyNotFoundError } from '@/modules/company/domain/errors/company.errors.js';
import { GetTrialPipelineUseCase } from '@/modules/pipeline/application/use-cases/get-trial-pipeline.usecase.js';
import { Pipeline, PipelineStage } from '@/modules/pipeline/domain/index.js';
import { TrialNotFoundError } from '@/modules/trial/domain/errors/trial.errors.js';
import { ForbiddenError } from '@/shared/errors/AppError.js';

describe('GetTrialPipelineUseCase', () => {
  let mockPipelineRepo: any;
  let mockTrialRepo: any;
  let mockCompanyRepo: any;
  let useCase: GetTrialPipelineUseCase;

  const mockDate = new Date(2026, 6, 26, 12, 0);
  const testStage = new PipelineStage('stage-1', 'pipe-1', 'Screening', PipelineStageType.SCREENING, 1);
  const testPipeline = new Pipeline('pipe-1', 'comp-1', 'trial-1', 'Trial Pipeline', 'Backend Dev', true, mockDate, mockDate, [testStage], []);

  beforeEach(() => {
    mockPipelineRepo = {
      findByTrialId: vi.fn(),
      createDefaultPipeline: vi.fn(),
    };
    mockTrialRepo = {
      findById: vi.fn(),
    };
    mockCompanyRepo = {
      findByUserId: vi.fn(),
    };
    useCase = new GetTrialPipelineUseCase(mockPipelineRepo, mockTrialRepo, mockCompanyRepo);
  });

  it('should return existing pipeline cleanly when company owner requests it', async () => {
    mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-1', name: 'Test Corp' });
    mockTrialRepo.findById.mockResolvedValue({ id: 'trial-1', companyId: 'comp-1', title: 'Senior Dev Assessment' });
    mockPipelineRepo.findByTrialId.mockResolvedValue(testPipeline);

    const res = await useCase.execute('user-owner', 'trial-1');

    expect(res.id).toBe('pipe-1');
    expect(res.stages).toHaveLength(1);
    expect(mockPipelineRepo.createDefaultPipeline).not.toHaveBeenCalled();
  });

  it('should auto-initialize default pipeline if one does not exist for the trial', async () => {
    mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-1', name: 'Test Corp' });
    mockTrialRepo.findById.mockResolvedValue({ id: 'trial-1', companyId: 'comp-1', title: 'Dev Trial', roleTitle: 'Engineer' });
    mockPipelineRepo.findByTrialId.mockResolvedValue(null);
    mockPipelineRepo.createDefaultPipeline.mockResolvedValue(testPipeline);

    const res = await useCase.execute('user-owner', 'trial-1');

    expect(mockPipelineRepo.createDefaultPipeline).toHaveBeenCalledWith('comp-1', 'trial-1', 'Dev Trial Pipeline', 'Engineer');
    expect(res.id).toBe('pipe-1');
  });

  it('should throw CompanyNotFoundError if user does not belong to any company', async () => {
    mockCompanyRepo.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute('user-unlinked', 'trial-1')).rejects.toThrow(CompanyNotFoundError);
  });

  it('should throw TrialNotFoundError if assessment trial does not exist', async () => {
    mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-1', name: 'Test Corp' });
    mockTrialRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-owner', 'nonexistent')).rejects.toThrow(TrialNotFoundError);
  });

  it('should throw ForbiddenError if requesting company does not own the target trial', async () => {
    mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-2', name: 'Other Corp' });
    mockTrialRepo.findById.mockResolvedValue({ id: 'trial-1', companyId: 'comp-1', title: 'Dev Trial' });

    await expect(useCase.execute('user-other', 'trial-1')).rejects.toThrow(ForbiddenError);
    await expect(useCase.execute('user-other', 'trial-1')).rejects.toThrow(/not have authorization/);
  });
});
