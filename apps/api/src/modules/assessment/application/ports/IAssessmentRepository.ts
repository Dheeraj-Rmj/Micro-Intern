import type { Assessment } from "../../domain/entities/Assessment.entity.js";
import type { AssessmentStatus, ExperienceLevel } from "@microintern/database";

export interface CreateAssessmentData {
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
  complexityScore?: number;
  aiDifficultyScore?: number;
  tasks?: Array<{
    title: string;
    description: string;
    taskType: string;
    isRequired?: boolean;
    maxPoints?: number;
    weight?: number;
    expectedOutput?: string;
    evaluationNotes?: string;
    sortOrder: number;
    config?: Record<string, unknown>;
    criteria?: Array<{
      title: string;
      description: string;
      weight?: number;
      maxPoints?: number;
      expectedOutput?: string;
    }>;
  }>;
  deliverables?: Array<{
    title: string;
    deliverableType: string;
    isRequired?: boolean;
    description?: string;
  }>;
}

export interface UpdateAssessmentData {
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
  complexityScore?: number;
  aiDifficultyScore?: number;
  tasks?: Array<{
    title: string;
    description: string;
    taskType: string;
    isRequired?: boolean;
    maxPoints?: number;
    weight?: number;
    expectedOutput?: string;
    evaluationNotes?: string;
    sortOrder: number;
    config?: Record<string, unknown>;
  }>;
  deliverables?: Array<{
    title: string;
    deliverableType: string;
    isRequired?: boolean;
    description?: string;
  }>;
}

export interface PublicAssessmentsFilter {
  skill?: string;
  level?: ExperienceLevel;
  search?: string;
  skip: number;
  take: number;
}

export interface CompanyAssessmentsFilter {
  status?: AssessmentStatus;
  skip: number;
  take: number;
}

export interface AssessmentVersionSummary {
  id: string;
  versionNumber: number;
  changeSummary: string | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface AssessmentAnalytics {
  views: number;
  applications: number;
  starts: number;
  submissions: number;
  completionRate: number;
  averageTimeMinutes: number;
  averageScore: number;
}

export interface IAssessmentRepository {
  findById(id: string): Promise<Assessment | null>;
  findBySlug(slug: string): Promise<Assessment | null>;
  findByIdOrSlug(identifier: string): Promise<Assessment | null>;
  create(data: CreateAssessmentData): Promise<Assessment>;
  update(id: string, data: UpdateAssessmentData): Promise<Assessment>;
  publish(id: string, publishedAt: Date): Promise<Assessment>;
  updateStatus(id: string, status: AssessmentStatus): Promise<Assessment>;
  duplicate(id: string, newSlug: string, createdById: string): Promise<Assessment>;
  archive(id: string): Promise<Assessment>;
  delete(id: string, deletedBy: string): Promise<void>;

  // Versioning
  createVersion(
    assessmentId: string,
    versionNumber: number,
    snapshot: unknown,
    changeSummary: string,
    createdBy: string,
  ): Promise<void>;
  listVersions(assessmentId: string): Promise<AssessmentVersionSummary[]>;
  restoreVersion(assessmentId: string, versionNumber: number): Promise<Assessment>;

  // Templates
  saveAsTemplate(data: {
    title: string;
    description: string;
    category: string;
    companyId?: string;
    snapshot: unknown;
  }): Promise<{ id: string }>;
  listTemplates(category?: string, companyId?: string): Promise<Array<any>>;

  // Analytics
  getAnalytics(assessmentId: string): Promise<AssessmentAnalytics>;

  // Queries
  listCompanyAssessments(
    companyId: string,
    filter: CompanyAssessmentsFilter,
  ): Promise<{ assessments: Assessment[]; total: number }>;
  listPublicAssessments(
    filter: PublicAssessmentsFilter,
  ): Promise<{ assessments: Assessment[]; total: number }>;
}
