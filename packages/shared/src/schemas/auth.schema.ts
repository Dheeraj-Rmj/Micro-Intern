import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterCandidateDto = z.infer<typeof RegisterCandidateSchema>;

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CANDIDATE' | 'COMPANY' | 'RECRUITER' | 'ADMIN';
}

export interface LoginResponse {
  user: AuthUserResponse;
  token: string;
}
