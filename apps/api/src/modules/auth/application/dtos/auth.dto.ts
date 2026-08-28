import { EmailSchema, PasswordSchema, NameSchema } from "@microintern/shared";
import { z } from "zod";

/**
 * Auth module DTOs (Data Transfer Objects).
 *
 * These schemas serve dual purpose:
 * 1. Zod validation at the HTTP layer (validate middleware)
 * 2. Type inference for use case inputs/outputs
 *
 * DTOs never leak domain entities to the outside world.
 * Domain entities never have Zod decorators.
 */

// ── Registration ─────────────────────────────────────────────────────────────

export const RegisterCandidateSchema = z.object({
  email: EmailSchema,
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/).optional(),
  password: PasswordSchema,
  firstName: NameSchema,
  lastName: NameSchema,
});

export type RegisterCandidateDto = z.infer<typeof RegisterCandidateSchema>;

export const RegisterCompanyOwnerSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  firstName: NameSchema,
  lastName: NameSchema,
  companyName: z.string().min(2).max(255).trim(),
  companyWebsite: z.string().url().optional(),
});

export type RegisterCompanyOwnerDto = z.infer<typeof RegisterCompanyOwnerSchema>;

// ── Login ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const RequestLoginOtpSchema = z.object({
  email: EmailSchema,
});

export type RequestLoginOtpDto = z.infer<typeof RequestLoginOtpSchema>;

export const VerifyLoginOtpSchema = z.object({
  email: EmailSchema,
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

export type VerifyLoginOtpDto = z.infer<typeof VerifyLoginOtpSchema>;

// ── Token Refresh ─────────────────────────────────────────────────────────────

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

// ── Password Operations ────────────────────────────────────────────────────────

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: PasswordSchema,
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: PasswordSchema,
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

// ── Email Verification ─────────────────────────────────────────────────────────

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;

// ── Auth Responses ─────────────────────────────────────────────────────────────

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
  tokenType: "Bearer";
};

export type AuthUserResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string | null;
  emailVerifiedAt: Date | null;
  avatarUrl: string | null;
  forcePasswordChange?: boolean;
};

export type LoginResponse =
  { user: AuthUserResponse; tokens: AuthTokensResponse } | { mfaRequired: true; mfaToken: string };
