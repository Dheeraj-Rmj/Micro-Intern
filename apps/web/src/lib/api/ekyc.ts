import { apiClient } from './client';

export const ekycApi = {
  // Initiates Stripe Identity Session
  createStripeSession: async () => {
    const response = await apiClient.post('/ekyc/stripe/session');
    return response.data;
  },

  // Manual document upload
  uploadManualDocuments: async (documentUrls: string[]) => {
    const response = await apiClient.post('/ekyc/manual/upload', { documentUrls });
    return response.data;
  },

  // Super Admin: Approve manual eKYC
  approveManualVerification: async (companyId: string) => {
    const response = await apiClient.post(`/ekyc/manual/approve/${companyId}`);
    return response.data;
  }
};
