import type { CandidateJourney, CandidateJourneyHistory, CandidateJourneyStatus } from '@microintern/database';

export interface CreateCandidateJourneyDTO {
  candidateId: string;
  companyId: string;
  roleProfileId?: string;
  assessmentId?: string;
  submissionId?: string;
  status?: CandidateJourneyStatus;
  notes?: string;
}

export interface AdvanceJourneyStatusDTO {
  journeyId: string;
  toStatus: CandidateJourneyStatus;
  changedById?: string;
  reason?: string;
  overallScore?: number;
  skillMatchPercentage?: number;
}

export interface ICandidateJourneyRepository {
  findById(id: string): Promise<CandidateJourney | null>;
  findByCandidateAndCompany(candidateId: string, companyId: string): Promise<CandidateJourney | null>;
  listByCandidate(candidateId: string): Promise<CandidateJourney[]>;
  listByCompany(companyId: string, status?: CandidateJourneyStatus): Promise<CandidateJourney[]>;
  create(data: CreateCandidateJourneyDTO): Promise<CandidateJourney>;
  advanceStatus(data: AdvanceJourneyStatusDTO): Promise<CandidateJourney>;
  getHistory(journeyId: string): Promise<CandidateJourneyHistory[]>;
}
