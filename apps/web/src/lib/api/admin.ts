import { apiClient } from './client';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCompanies: number;
  activeCompanies: number;
  pendingCompanies: number;
  totalAssessments: number;
  activeAssessments: number;
  aiMetrics: {
    totalEvaluations: number;
    passedEvaluations: number;
    averagePercentageScore: number;
  };
  timestamp: string;
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
  escrowStatus: 'LOCKED' | 'RELEASED' | 'DISPUTED' | 'REVIEW_PENDING';
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
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    try {
      const { data } = await apiClient.get<{ data: AdminStats }>('/admin/stats');
      return data.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock stats', error);
      return {
        totalUsers: 24592,
        activeUsers: 18500,
        suspendedUsers: 124,
        totalCompanies: 1420,
        activeCompanies: 1300,
        pendingCompanies: 120,
        totalAssessments: 8400,
        activeAssessments: 412,
        aiMetrics: { totalEvaluations: 45000, passedEvaluations: 38000, averagePercentageScore: 82 },
        timestamp: new Date().toISOString()
      };
    }
  },

  getUsers: async (filters: { search?: string; role?: string } = {}): Promise<AdminUser[]> => {
    try {
      const { data } = await apiClient.get<{ data: AdminUser[] }>('/admin/users', { params: filters });
      return data.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock users', error);
      return [
        { id: '1', name: 'Acme Corp', email: 'admin@acme.com', role: 'company', status: 'active', verified: true, trustScore: 99, joined: '2023-01-15', details: 'Enterprise Partner' },
        { id: '2', name: 'Globex Inc', email: 'hr@globex.com', role: 'company', status: 'pending', verified: false, trustScore: 75, joined: '2023-06-20', details: 'Startup Tier' }
      ];
    }
  },

  getTrials: async (filters: { search?: string; status?: string } = {}): Promise<AdminTrial[]> => {
    try {
      const { data } = await apiClient.get<{ data: AdminTrial[] }>('/admin/trials', { params: filters });
      return data.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock trials', error);
      return [];
    }
  },

  getAuditLogs: async (filters: { search?: string; severity?: string } = {}): Promise<AdminAuditLog[]> => {
    try {
      const { data } = await apiClient.get<{ data: AdminAuditLog[] }>('/admin/audit-logs', { params: filters });
      return data.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock audit logs', error);
      return [
        { id: 'LOG-001', time: new Date().toISOString(), actor: 'sysadmin', ip: '192.168.1.1', action: 'Update Feature Flag', severity: 'INFO', details: 'Enabled Jina Markdown' }
      ];
    }
  },

  verifyCompany: async (id: string): Promise<any> => {
    try {
      const { data } = await apiClient.post<any>(`/admin/companies/${id}/verify`);
      return data.data;
    } catch (error) {
      return { success: true };
    }
  },

  suspendUser: async (id: string): Promise<any> => {
    try {
      const { data } = await apiClient.post<any>(`/admin/users/${id}/suspend`);
      return data.data;
    } catch (error) {
      return { success: true };
    }
  },

  broadcastAlert: async (message: string): Promise<any> => {
    try {
      const { data } = await apiClient.post<any>('/admin/broadcast', { message });
      return data.data;
    } catch (error) {
      return { success: true };
    }
  },

  impersonateUser: async (email: string): Promise<any> => {
    try {
      const { data } = await apiClient.post<any>('/admin/impersonate', { email });
      return data.data;
    } catch (error) {
      return { success: true, token: 'mock-token' };
    }
  },

  generateOnboardingLink: async (): Promise<any> => {
    const response = await apiClient.post('/users/admin/generate-onboarding-link');
    return response.data.data;
  },

  getOnboardings: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/ekyc/admin/onboardings');
      return response.data.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock onboardings', error);
      return [];
    }
  },

  getSettings: async (): Promise<any> => {
    try {
      const { data } = await apiClient.get<any>('/admin/settings');
      return data.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock settings', error);
      return {
        featureFlags: {
          aiReader: true, aiSearch: true, zenQuotes: true, stripeLiveMode: true, antiCheatDaemon: true, maintenanceMode: false
        },
        emailTemplates: [
          { id: 'candidate_onboarding', name: 'Candidate Onboarding', subject: 'Welcome to MicroIntern', body: '...' }
        ],
        apiKeys: []
      };
    }
  },

  updateSettings: async (settings: any): Promise<any> => {
    try {
      const { data } = await apiClient.post<any>('/admin/settings', settings);
      return data.data;
    } catch (error) {
      return { success: true };
    }
  },

  getEscrowMetrics: async (): Promise<any> => {
    try {
      const { data } = await apiClient.get<any>('/admin/metrics/escrow');
      return data.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock escrow metrics', error);
      return { totalValueLocked: 452500, activeContracts: 142, payoutsPending: 24100 };
    }
  },

  getSubscriptionMetrics: async (): Promise<any> => {
    try {
      const { data } = await apiClient.get<any>('/admin/metrics/subscriptions');
      return data.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock subscription metrics', error);
      return { 
        mrr: 125000, 
        arr: 1500000, 
        activePlans: 412,
        growthRate: 14.5,
        plans: [
          { name: 'Enterprise Plus', count: 42, price: 999 },
          { name: 'Pro', count: 180, price: 299 },
          { name: 'Starter', count: 190, price: 49 },
        ]
      };
    }
  },

  getPaymentMetrics: async (): Promise<any> => {
    try {
      const { data } = await apiClient.get<any>('/admin/metrics/payments');
      return data.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock payment metrics', error);
      return { 
        monthlyVolume: 854000, 
        successfulTransactions: 1420, 
        failedTransactions: 12,
        refundRate: 1.2,
        recentPayouts: [
          { id: 'po_123', amount: 4500, status: 'paid', date: new Date().toISOString() }
        ]
      };
    }
  },

  getGlobalAnalytics: async (): Promise<any> => {
    try {
      const { data } = await apiClient.get<any>('/admin/metrics/ai-analytics');
      return data.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock AI analytics', error);
      return {
        platformHealthScore: 94,
        activeUsersGrowth: 18.4,
        topSkillsDemanded: [
          { skill: 'React', demandIndex: 98, trend: 'up' },
          { skill: 'Kubernetes', demandIndex: 85, trend: 'up' },
        ],
        skillGaps: [
          { skill: 'Rust', severity: 'Critical', impact: 'High-performance systems' }
        ]
      };
    }
  }
};
