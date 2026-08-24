import { apiClient } from "./client";

export const companyApi = {
  // Enterprise Hub / Company Admin endpoints

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

  inviteMember: async (email: string, role: string) => {
    const response = await apiClient.post("/companies/me/members/invite", { email, role });
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
};
