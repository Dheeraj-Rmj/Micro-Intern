
import type { Submission } from '../../domain/entities/Submission.entity.js';
import type { SubmissionAnswer } from '../../domain/entities/SubmissionAnswer.entity.js';
import type { SubmissionStatus } from '@microintern/database';

export interface SaveAnswerData {
  taskId: string;
  answerText?: string;
  answerFileUrl?: string;
  answerData?: Record<string, unknown>;
}

export interface CreateSubmissionData {
  assessmentId: string;
  candidateId: string;
  status?: SubmissionStatus;
  attemptNumber?: number;
  startedAt?: Date;
  expiresAt?: Date;
}

export interface ISubmissionRepository {
  findById(id: string): Promise<Submission | null>;
  findActiveByCandidateAndAssessment(candidateId: string, assessmentId: string): Promise<Submission | null>;
  countAttempts(candidateId: string, assessmentId: string): Promise<number>;
  create(data: CreateSubmissionData): Promise<Submission>;
  updateStatus(
    id: string,
    status: SubmissionStatus,
    metadata?: { submittedAt?: Date; totalScore?: number; isPassed?: boolean }
  ): Promise<Submission>;
  saveAnswers(submissionId: string, answers: SaveAnswerData[]): Promise<SubmissionAnswer[]>;
  listByCandidate(
    candidateId: string,
    pagination: { skip: number; take: number }
  ): Promise<{ submissions: Submission[]; total: number }>;
}
