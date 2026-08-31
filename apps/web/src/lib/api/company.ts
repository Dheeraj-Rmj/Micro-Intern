import { apiClient } from "./client";

export const companyApi = {
  // ── Company Admin endpoints ───────────────────────────────────────────────

  getDepartments: async () => {
    const response = await apiClient.get("/companies/me/departments");
    return response.data;
  },

  getSubmissions: async () => {
    const response = await apiClient.get("/companies/me/assessments/submissions");
    return response.data;
  },

  getMembers: async () => {
    const response = await apiClient.get("/companies/me/members");
    return response.data;
  },

  inviteMember: async (email: string, role: string, name?: string) => {
    const response = await apiClient.post("/companies/me/members/invite", { email, role, name });
    return response.data;
  },

  removeMember: async (userId: string) => {
    const response = await apiClient.delete(`/companies/me/members/${userId}`);
    return response.data;
  },

  getHiringAnalytics: async () => {
    const response = await apiClient.get("/companies/me/analytics");
    return response.data;
  },

  getBilling: async () => {
    const response = await apiClient.get("/companies/me/billing");
    return response.data;
  },

  getAIInsights: async () => {
    const response = await apiClient.get("/companies/me/ai-insights");
    return response.data;
  },

  getAIProviders: async () => {
    const response = await apiClient.get("/companies/ai/providers");
    return response.data;
  },

  addAIProvider: async (data: { provider: string; apiKey: string; isFallback: boolean }) => {
    const response = await apiClient.post("/companies/ai/providers", data);
    return response.data;
  },

  deleteAIProvider: async (provider: string) => {
    const response = await apiClient.delete(`/companies/ai/providers/${provider}`);
    return response.data;
  },

  // ── Assessments ───────────────────────────────────────────────────────────

  getAssessments: async () => {
    try {
      const response = await apiClient.get("/companies/me/assessments", { params: { limit: 50 } });
      return response.data?.data ?? { assessments: [], total: 0 };
    } catch {
      return { assessments: [], total: 0 };
    }
  },

  createAssessment: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post("/assessments", payload);
    return response.data;
  },

  publishAssessment: async (id: string) => {
    const response = await apiClient.post(`/assessments/${id}/publish`, {});
    return response.data;
  },

  archiveAssessment: async (id: string) => {
    const response = await apiClient.post(`/assessments/${id}/archive`, {});
    return response.data;
  },

  deleteAssessment: async (id: string) => {
    const response = await apiClient.delete(`/assessments/${id}`);
    return response.data;
  },

  // ── Candidate Journeys / Applications ────────────────────────────────────

  getCompanyJourneys: async (companyId: string) => {
    try {
      const response = await apiClient.get(`/candidate-journeys/company/${companyId}`);
      return response.data?.data ?? [];
    } catch {
      return [];
    }
  },

  updateJourneyStatus: async (journeyId: string, toStatus: string, reason?: string) => {
    const response = await apiClient.put(`/candidate-journeys/${journeyId}/advance`, {
      toStatus,
      reason,
    });
    return response.data;
  },

  // ── AI Task Recommendation ("Give Task") ─────────────────────────────────

  getAITaskRecommendation: async (candidateId: string, roleProfileId?: string) => {
    try {
      const response = await apiClient.post("/matching/candidate", {
        candidateId,
        roleProfileId,
      });
      return response.data?.data ?? null;
    } catch {
      return null;
    }
  },

  rankCandidates: async (roleProfileId: string, candidateIds: string[]) => {
    try {
      const response = await apiClient.post("/matching/rank", {
        roleProfileId,
        candidateIds,
      });
      return response.data?.data ?? [];
    } catch {
      return [];
    }
  },

  // ── Company Profile ───────────────────────────────────────────────────────

  getCompanyProfile: async () => {
    try {
      const response = await apiClient.get("/companies/me");
      return response.data?.data ?? null;
    } catch {
      return null;
    }
  },

  updateCompany: async (payload: Record<string, unknown>) => {
    const response = await apiClient.put("/companies/me", payload);
    return response.data;
  },
};
