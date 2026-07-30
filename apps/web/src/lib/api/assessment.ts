import { apiClient } from './client';

export interface AssessmentTaskDto {
  id?: string;
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
}

export interface AssessmentDeliverableDto {
  id?: string;
  title: string;
  deliverableType: string;
  isRequired?: boolean;
  description?: string;
}

export interface AssessmentDto {
  id: string;
  companyId: string;
  createdById: string;
  status: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  skillsRequired: string[];
  roleTitle?: string | null;
  level?: string | null;
  durationMinutes: number;
  passingScore: number;
  maxAttempts: number;
  isPublic: boolean;
  complexityScore?: number | null;
  aiDifficultyScore?: number | null;
  tasks: AssessmentTaskDto[];
  deliverables?: AssessmentDeliverableDto[];
  company?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface AssessmentValidationResult {
  isValid: boolean;
  canPublish: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export const assessmentApi = {
  createAssessment: async (payload: Partial<AssessmentDto>): Promise<AssessmentDto> => {
    const { data } = await apiClient.post<{ data: AssessmentDto }>('/assessments', payload);
    return data.data;
  },

  updateAssessment: async (id: string, payload: Partial<AssessmentDto>): Promise<AssessmentDto> => {
    const { data } = await apiClient.put<{ data: AssessmentDto }>(`/assessments/${id}`, payload);
    return data.data;
  },

  publishAssessment: async (id: string): Promise<AssessmentDto> => {
    const { data } = await apiClient.post<{ data: AssessmentDto }>(`/assessments/${id}/publish`);
    return data.data;
  },

  duplicateAssessment: async (id: string): Promise<AssessmentDto> => {
    const { data } = await apiClient.post<{ data: AssessmentDto }>(`/assessments/${id}/duplicate`);
    return data.data;
  },

  archiveAssessment: async (id: string): Promise<AssessmentDto> => {
    const { data } = await apiClient.post<{ data: AssessmentDto }>(`/assessments/${id}/archive`);
    return data.data;
  },

  deleteAssessment: async (id: string): Promise<void> => {
    await apiClient.delete(`/assessments/${id}`);
  },

  getAssessmentDetails: async (idOrSlug: string): Promise<AssessmentDto> => {
    const { data } = await apiClient.get<{ data: AssessmentDto }>(`/assessments/${idOrSlug}`);
    return data.data;
  },

  listPublicAssessments: async (params?: Record<string, unknown>): Promise<{
    assessments: AssessmentDto[];
    meta: { pagination?: { total: number; page: number; limit: number } };
  }> => {
    const { data } = await apiClient.get<{
      data: AssessmentDto[];
      meta: { pagination?: { total: number; page: number; limit: number } };
    }>('/assessments', { params });
    return { assessments: data.data, meta: data.meta };
  },

  createVersion: async (id: string, changeSummary: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ data: { message: string } }>(`/assessments/${id}/versions`, {
      changeSummary,
    });
    return data.data;
  },

  listVersions: async (
    id: string
  ): Promise<
    Array<{
      id: string;
      versionNumber: number;
      changeSummary: string | null;
      createdBy: string | null;
      createdAt: string;
    }>
  > => {
    const { data } = await apiClient.get<{ data: any[] }>(`/assessments/${id}/versions`);
    return data.data;
  },

  restoreVersion: async (id: string, versionNumber: number): Promise<AssessmentDto> => {
    const { data } = await apiClient.post<{ data: AssessmentDto }>(`/assessments/${id}/versions/restore`, {
      versionNumber,
    });
    return data.data;
  },

  saveAsTemplate: async (
    id: string,
    payload: { title: string; description: string; category: string; isGlobal?: boolean }
  ): Promise<{ id: string }> => {
    const { data } = await apiClient.post<{ data: { id: string } }>(
      `/assessments/${id}/template`,
      payload
    );
    return data.data;
  },

  listTemplates: async (params?: { category?: string }): Promise<any[]> => {
    const { data } = await apiClient.get<{ data: any[] }>('/assessments/templates', { params });
    return data.data;
  },

  getAnalytics: async (id: string): Promise<{
    views: number;
    applications: number;
    starts: number;
    submissions: number;
    completionRate: number;
    averageTimeMinutes: number;
    averageScore: number;
  }> => {
    const { data } = await apiClient.get<{ data: any }>(`/assessments/${id}/analytics`);
    return data.data;
  },

  validateAssessment: async (id: string): Promise<AssessmentValidationResult> => {
    const { data } = await apiClient.get<{ data: AssessmentValidationResult }>(`/assessments/${id}/validate`);
    return data.data;
  },

  triggerAIJob: async (
    id: string,
    action: string,
    input: Record<string, unknown>
  ): Promise<{ message: string; jobId: string; action: string }> => {
    const { data } = await apiClient.post<{
      data: { message: string; jobId: string; action: string };
    }>(`/assessments/${id}/ai`, { action, input });
    return data.data;
  },
};
