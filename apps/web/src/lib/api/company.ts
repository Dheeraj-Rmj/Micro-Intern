import { apiClient } from './client';

export const companyApi = {
  // Enterprise Hub / Company Admin endpoints
  
  getDepartments: async () => {
    const response = await apiClient.get('/companies/me/departments');
    return response.data;
  },
  
  getHiringAnalytics: async () => {
    const response = await apiClient.get('/companies/me/analytics');
    return response.data;
  },
  
  getBilling: async () => {
    const response = await apiClient.get('/companies/me/billing');
    return response.data;
  },
  
  getAIInsights: async () => {
    const response = await apiClient.get('/companies/me/ai-insights');
    return response.data;
  }
};
