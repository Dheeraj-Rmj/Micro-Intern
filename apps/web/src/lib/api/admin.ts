import { apiClient } from "./client";

export interface AdminStats {
  users: {
    total: number;
    active: number;
    suspended: number;
  };
  companies: {
    total: number;
    active: number;
    pendingVerification: number;
  };
  assessments: {
    total: number;
    active: number;
  };
  aiUsage: {
    totalEvaluations: number;
    passedEvaluations: number;
    passRate: number;
    averagePercentageScore: number;
  };
  generatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  verified: boolean;
  trustScore: number;
  joined: string;
  details: string;
  activeTrials?: number;
  escrowLocked?: number;
}

export interface AdminTrial {
  id: string;
  title: string;
  company: string;
  stipend: string;
  candidate: string;
  escrowStatus: "LOCKED" | "RELEASED" | "DISPUTED" | "REVIEW_PENDING";
  aiScore: number;
  submittedAt: string;
  category: string;
}

export interface AdminAuditLog {
  id: string;
  time: string;
  actor: string;
  ip: string;
  action: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  details: string;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await apiClient.get<{ data: AdminStats }>("/admin/stats");
    return data.data;
  },

  getUsers: async (filters: { search?: string; role?: string } = {}): Promise<AdminUser[]> => {
    const { data } = await apiClient.get<{ data: AdminUser[] }>("/admin/users", {
      params: filters,
    });
    return data.data;
  },

  getTrials: async (filters: { search?: string; status?: string } = {}): Promise<AdminTrial[]> => {
    const { data } = await apiClient.get<{ data: AdminTrial[] }>("/admin/trials", {
      params: filters,
    });
    return data.data;
  },

  getAuditLogs: async (
    filters: { search?: string; severity?: string } = {},
  ): Promise<AdminAuditLog[]> => {
    const { data } = await apiClient.get<{ data: AdminAuditLog[] }>("/admin/audit-logs", {
      params: filters,
    });
    return data.data;
  },

  verifyCompany: async (id: string): Promise<any> => {
    const { data } = await apiClient.post<any>(`/admin/companies/${id}/verify`);
    return data.data;
  },

  suspendUser: async (id: string): Promise<any> => {
    const { data } = await apiClient.post<any>(`/admin/users/${id}/suspend`);
    return data.data;
  },

  broadcastAlert: async (message: string): Promise<any> => {
    const { data } = await apiClient.post<any>("/admin/broadcast", { message });
    return data.data;
  },

  impersonateUser: async (email: string): Promise<any> => {
    const { data } = await apiClient.post<any>("/admin/impersonate", { email });
    return data.data;
  },

  generateOnboardingLink: async (): Promise<any> => {
    const response = await apiClient.post("/users/admin/generate-onboarding-link");
    return response.data.data;
  },

  getOnboardings: async (): Promise<any[]> => {
    const response = await apiClient.get("/ekyc/admin/onboardings");
    return response.data.data;
  },

  getSettings: async (): Promise<any> => {
    const { data } = await apiClient.get<any>("/admin/settings");
    return data.data;
  },

  updateSettings: async (settings: any): Promise<any> => {
    const { data } = await apiClient.post<any>("/admin/settings", settings);
    return data.data;
  },

  getEscrowMetrics: async (): Promise<any> => {
    const { data } = await apiClient.get<any>("/admin/metrics/escrow");
    return data.data;
  },

  getSubscriptionMetrics: async (): Promise<any> => {
    const { data } = await apiClient.get<any>("/admin/metrics/subscriptions");
    return data.data;
  },

  getPaymentMetrics: async (): Promise<any> => {
    const { data } = await apiClient.get<any>("/admin/metrics/payments");
    return data.data;
  },

  getGlobalAnalytics: async (): Promise<any> => {
    const { data } = await apiClient.get<any>("/admin/metrics/ai-analytics");
    return data.data;
  },
};
