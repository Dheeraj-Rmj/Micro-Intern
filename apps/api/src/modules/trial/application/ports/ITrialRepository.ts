import type { Trial } from '../../domain/entities/Trial.entity.js';
import type { TrialStatus, ExperienceLevel } from '@microintern/database';


export interface CreateTrialData {
  companyId: string;
  createdById: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  skillsRequired?: string[];
  roleTitle?: string;
  level?: ExperienceLevel;
  durationMinutes: number;
  passingScore?: number;
  maxAttempts?: number;
  isPublic?: boolean;
  tasks?: Array<{
    title: string;
    description: string;
    taskType: string;
    isRequired?: boolean;
    maxPoints?: number;
    sortOrder: number;
    config?: Record<string, unknown>;
  }>;
}

export interface UpdateTrialData {
  title?: string;
  description?: string;
  instructions?: string;
  skillsRequired?: string[];
  roleTitle?: string;
  level?: ExperienceLevel;
  durationMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  isPublic?: boolean;
  tasks?: Array<{
    title: string;
    description: string;
    taskType: string;
    isRequired?: boolean;
    maxPoints?: number;
    sortOrder: number;
    config?: Record<string, unknown>;
  }>;
}

export interface PublicTrialsFilter {
  skill?: string;
  level?: ExperienceLevel;
  search?: string;
  skip: number;
  take: number;
}

export interface CompanyTrialsFilter {
  status?: TrialStatus;
  skip: number;
  take: number;
}

export interface ITrialRepository {
  findById(id: string): Promise<Trial | null>;
  findBySlug(slug: string): Promise<Trial | null>;
  findByIdOrSlug(identifier: string): Promise<Trial | null>;
  create(data: CreateTrialData): Promise<Trial>;
  update(id: string, data: UpdateTrialData): Promise<Trial>;
  publish(id: string, publishedAt: Date): Promise<Trial>;
  listCompanyTrials(companyId: string, filter: CompanyTrialsFilter): Promise<{ trials: Trial[]; total: number }>;
  listPublicTrials(filter: PublicTrialsFilter): Promise<{ trials: Trial[]; total: number }>;
}
