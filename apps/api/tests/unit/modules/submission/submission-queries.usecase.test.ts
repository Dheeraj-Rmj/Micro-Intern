import { EvaluationStatus } from '@microintern/database';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GetSubmissionEvaluationUseCase } from '@/modules/evaluation/application/use-cases/get-submission-evaluation.usecase.js';
import { ListCandidateSubmissionsUseCase } from '@/modules/submission/application/use-cases/list-candidate-submissions.usecase.js';
import { UnauthorizedError } from '@/shared/errors/index.js';

describe('Submission & Evaluation Query Use Cases', () => {
  let getEvaluationUseCase: GetSubmissionEvaluationUseCase;
  let listSubmissionsUseCase: ListCandidateSubmissionsUseCase;
  let mockSubRepo: any;
  let mockEvalRepo: any;
  let mockGetProfileUseCase: any;

  beforeEach(() => {
    mockSubRepo = {
      findById: vi.fn().mockResolvedValue({
        id: 'sub-100',
        assessmentId: 'assessment-1',
        candidateId: 'cand-owner',
      }),
      listByCandidate: vi.fn().mockResolvedValue({
        submissions: [{ id: 'sub-100' }, { id: 'sub-101' }],
        total: 2,
      }),
    };

    mockEvalRepo = {
      findBySubmissionId: vi.fn().mockResolvedValue({
        id: 'eval-100',
        submissionId: 'sub-100',
        status: EvaluationStatus.COMPLETED,
        percentageScore: 92,
        isPassed: true,
        summary: 'Excellent performance.',
      }),
    };

    mockGetProfileUseCase = {
      execute: vi.fn().mockImplementation(async (userId) => ({
        id: userId === 'user-owner' ? 'cand-owner' : 'cand-stranger',
        userId,
      })),
    };

    getEvaluationUseCase = new GetSubmissionEvaluationUseCase(mockSubRepo, mockEvalRepo, mockGetProfileUseCase);
    listSubmissionsUseCase = new ListCandidateSubmissionsUseCase(mockSubRepo, mockGetProfileUseCase);
  });

  it('should allow candidate owner to inspect their AI evaluation results', async () => {
    const res = await getEvaluationUseCase.execute('sub-100', 'user-owner');
    expect(res.id).toBe('eval-100');
    expect(res.percentageScore).toBe(92);
    expect(res.isPassed).toBe(true);
  });

  it('should throw UnauthorizedError if stranger candidate attempts to access private evaluation results', async () => {
    await expect(getEvaluationUseCase.execute('sub-100', 'user-stranger')).rejects.toThrow(UnauthorizedError);
  });

  it('should paginate and return directory of candidate assessment submissions', async () => {
    const res = await listSubmissionsUseCase.execute('user-owner', { page: 1, limit: 10 });
    expect(res.submissions).toHaveLength(2);
    expect(res.pagination.total).toBe(2);
    expect(res.pagination.page).toBe(1);
    expect(mockSubRepo.listByCandidate).toHaveBeenCalledWith('cand-owner', { skip: 0, take: 10 });
  });
});
