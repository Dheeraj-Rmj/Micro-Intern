import { apiClient } from "./client";

// ── Types ───────────────────────────────────────────────────────────────────

export interface CandidateJourney {
  id: string;
  candidateId: string;
  assessmentId: string;
  companyId: string;
  status: string;
  stage: string;
  score?: number;
  matchScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assessment?: {
    id: string;
    title: string;
    description?: string;
    company?: { id: string; name: string; logoUrl?: string };
    skillsRequired?: string[];
    durationMinutes?: number;
  };
}

export interface CandidateSubmission {
  id: string;
  assessmentId: string;
  candidateId: string;
  status: string;
  score?: number;
  feedback?: string;
  solutionText?: string;
  repoUrl?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  assessment?: {
    id: string;
    title: string;
    company?: { id: string; name: string };
  };
}

export interface PublicAssessment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  skillsRequired: string[];
  roleTitle?: string;
  level?: string;
  durationMinutes: number;
  passingScore: number;
  isPublic: boolean;
  complexityScore?: number;
  status: string;
  company?: { id: string; name: string; logoUrl?: string; slug?: string };
  tasks?: Array<{ id: string; title: string; description: string; taskType: string }>;
  publishedAt?: string;
  createdAt: string;
}

// ── Candidate Journey API ────────────────────────────────────────────────────

export const journeyApi = {
  getMyCandidateJourneys: async (): Promise<CandidateJourney[]> => {
    try {
      const { data } = await apiClient.get<{ data: CandidateJourney[] }>(
        "/candidate-journeys/candidate/me",
      );
      return data.data ?? [];
    } catch {
      return [];
    }
  },

  getJourneyById: async (id: string): Promise<CandidateJourney | null> => {
    try {
      const { data } = await apiClient.get<{ data: CandidateJourney }>(
        `/candidate-journeys/${id}`,
      );
      return data.data;
    } catch {
      return null;
    }
  },
};

// ── Submission API ───────────────────────────────────────────────────────────

export const submissionApi = {
  getMyCandidateSubmissions: async (): Promise<CandidateSubmission[]> => {
    try {
      const { data } = await apiClient.get<{ data: CandidateSubmission[] }>(
        "/submissions/me",
      );
      return data.data ?? [];
    } catch {
      return [];
    }
  },

  startAssessment: async (assessmentId: string): Promise<{ submissionId: string }> => {
    const { data } = await apiClient.post<{ data: { submissionId: string } }>(
      `/assessments/${assessmentId}/start`,
      {},
    );
    return data.data;
  },

  submitAssessment: async (
    assessmentId: string,
    payload: { solutionText?: string; repoUrl?: string; fileNames?: string[] },
  ): Promise<CandidateSubmission> => {
    const formData = new FormData();
    if (payload.solutionText) formData.append("solutionText", payload.solutionText);
    if (payload.repoUrl) formData.append("repoUrl", payload.repoUrl);
    const { data } = await apiClient.post<{ data: CandidateSubmission }>(
      `/assessments/${assessmentId}/submit`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },
};

// ── Public Assessments (for Discover page) ──────────────────────────────────

export const publicAssessmentApi = {
  listPublished: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<{ assessments: PublicAssessment[]; total: number }> => {
    try {
      const { data } = await apiClient.get<{
        data: { assessments: PublicAssessment[]; total: number };
      }>("/assessments", { params: { status: "PUBLISHED", isPublic: true, ...params } });
      return data.data ?? { assessments: [], total: 0 };
    } catch {
      return { assessments: [], total: 0 };
    }
  },

  getById: async (id: string): Promise<PublicAssessment | null> => {
    try {
      const { data } = await apiClient.get<{ data: PublicAssessment }>(`/assessments/${id}`);
      return data.data;
    } catch {
      return null;
    }
  },
};

// ── Notifications API ────────────────────────────────────────────────────────

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export const notificationsApi = {
  list: async (): Promise<ApiNotification[]> => {
    try {
      const { data } = await apiClient.get<{ data: ApiNotification[] }>("/notifications");
      return data.data ?? [];
    } catch {
      return [];
    }
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`, {});
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.put("/notifications/read-all", {});
  },
};
