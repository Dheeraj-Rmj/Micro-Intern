import type { Evaluation } from '../../domain/entities/Evaluation.entity.js';
import type { EvaluationStatus } from '@microintern/database';


export interface SaveEvaluationData {
  submissionId: string;
  status: EvaluationStatus;
  aiProvider?: string;
  aiModel?: string;
  promptVersion?: string;
  totalScore?: number;
  maxPossibleScore?: number;
  percentageScore?: number;
  isPassed?: boolean;
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  rawResponse?: Record<string, unknown>;
  startedAt?: Date;
  completedAt?: Date;
}

export interface IEvaluationRepository {
  findBySubmissionId(submissionId: string): Promise<Evaluation | null>;
  save(data: SaveEvaluationData): Promise<Evaluation>;
  updateStatus(id: string, status: EvaluationStatus): Promise<Evaluation>;
}
