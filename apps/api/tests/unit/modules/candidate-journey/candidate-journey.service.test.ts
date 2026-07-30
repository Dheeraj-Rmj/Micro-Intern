import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CandidateJourneyService } from '@/modules/candidate-journey/application/CandidateJourneyService.js';
import { CandidateJourneyStatus } from '@microintern/database';

describe('CandidateJourneyService', () => {
  let service: CandidateJourneyService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByCandidateAndCompany: vi.fn(),
      listByCandidate: vi.fn(),
      listByCompany: vi.fn(),
      create: vi.fn(),
      advanceStatus: vi.fn(),
    };
    service = new CandidateJourneyService(mockRepo);
  });

  it('should start a candidate journey and emit event', async () => {
    mockRepo.findByCandidateAndCompany.mockResolvedValue(null);
    const newJourney = {
      id: 'journey-1',
      candidateId: 'cand-1',
      companyId: 'comp-1',
      status: CandidateJourneyStatus.INVITED,
    };
    mockRepo.create.mockResolvedValue(newJourney);

    const result = await service.startJourney({ candidateId: 'cand-1', companyId: 'comp-1' }, 'admin-1');
    expect(result.id).toBe('journey-1');
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should prevent illegal status transitions without FORCE_OVERRIDE', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'journey-1',
      status: CandidateJourneyStatus.INVITED,
    });

    await expect(
      service.advanceJourney(
        {
          journeyId: 'journey-1',
          toStatus: CandidateJourneyStatus.HIRED, // Illegal jump from INVITED -> HIRED
        },
        'admin-1'
      )
    ).rejects.toThrow('Invalid status transition from INVITED to HIRED.');
  });
});
