import { apiClient } from "@/lib/api/client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  CandidateUser,
  ResetPasswordCredentials,
} from "../types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{
      success: boolean;
      data: { user: CandidateUser; tokens: { accessToken: string; refreshToken?: string } };
    }>("/auth/login", credentials);
    const { user, tokens } = response.data.data;
    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },

  async requestLoginOtp(email: string): Promise<void> {
    await apiClient.post("/auth/login-otp/request", { email });
  },

  async verifyLoginOtp(email: string, otp: string): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      "/auth/login-otp/verify",
      { email, otp },
    );
    return response.data.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{
      success: boolean;
      data: { user: CandidateUser; tokens: { accessToken: string; refreshToken?: string } };
    }>("/auth/register/candidate", {
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      email: credentials.email,
      password: credentials.password,
    });
    const { user, tokens } = response.data.data;
    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getCurrentUser(): Promise<CandidateUser> {
    const response = await apiClient.get<{ success: boolean; data: CandidateUser }>("/auth/me");
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(data: ResetPasswordCredentials): Promise<void> {
    await apiClient.post("/auth/reset-password", {
      token: data.token,
      newPassword: data.password,
    });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post("/auth/verify-email", { token });
  },

  async changePassword(newPassword: string): Promise<void> {
    await apiClient.post("/auth/change-password", { newPassword });
  },

  async completeOnboarding(): Promise<void> {
    await apiClient.post("/auth/complete-onboarding", {});
  },
};
