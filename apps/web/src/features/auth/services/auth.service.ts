import { apiClient } from '@/lib/api/client';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  CandidateUser,
  ResetPasswordCredentials
} from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/api/v1/auth/login',
      credentials
    );
    return response.data.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/api/v1/auth/register-candidate',
      {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        email: credentials.email,
        password: credentials.password
      }
    );
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout');
  },

  async getCurrentUser(): Promise<CandidateUser> {
    const response = await apiClient.get<{ success: boolean; data: CandidateUser }>(
      '/api/v1/auth/me'
    );
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/v1/auth/forgot-password', { email });
  },

  async resetPassword(data: ResetPasswordCredentials): Promise<void> {
    await apiClient.post('/api/v1/auth/reset-password', {
      token: data.token,
      newPassword: data.password
    });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/api/v1/auth/verify-email', { token });
  }
};
