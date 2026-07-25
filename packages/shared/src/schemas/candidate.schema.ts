import { z } from 'zod';


export const CandidateSkillSchema = z.object({
  id: z.string().uuid().optional(),
  skill: z.string().min(1).max(100),
  level: z.number().int().min(1).max(5).default(1),
  verified: z.boolean().default(false),
});

export const CandidateExperienceSchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional(),
}).refine((data) => {
  if (data.isCurrent) return true;
  if (data.endDate === null || data.endDate === undefined || data.endDate === '') return false;
  return new Date(data.startDate) <= new Date(data.endDate);
}, {
  message: "End date must be after start date when not current",
  path: ["endDate"],
});

export const CandidateEducationSchema = z.object({
  id: z.string().uuid().optional(),
  institution: z.string().min(1).max(255),
  degree: z.string().min(1).max(255),
  fieldOfStudy: z.string().max(255).nullable().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
}).refine((data) => {
  if (data.endDate === null || data.endDate === undefined || data.endDate === '') return true;
  return new Date(data.startDate) <= new Date(data.endDate);
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const CandidateCertificateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  issuer: z.string().min(1).max(255),
  issueDate: z.string().datetime(),
  expirationDate: z.string().datetime().nullable().optional(),
  url: z.string().url().nullable().optional(),
}).refine((data) => {
  if (data.expirationDate === null || data.expirationDate === undefined || data.expirationDate === '') return true;
  return new Date(data.issueDate) <= new Date(data.expirationDate);
}, {
  message: "Expiration date must be after issue date",
  path: ["expirationDate"],
});

export const CandidateSocialSchema = z.object({
  id: z.string().uuid().optional(),
  platform: z.enum(['GITHUB', 'LINKEDIN', 'PORTFOLIO', 'LEETCODE', 'HACKERRANK', 'CODEFORCES', 'BEHANCE', 'DRIBBBLE']),
  url: z.string().url(),
});

export const CandidatePreferenceSchema = z.object({
  employmentType: z.array(z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'])),
  workMode: z.array(z.enum(['REMOTE', 'HYBRID', 'ON_SITE'])),
  noticePeriod: z.enum(['IMMEDIATE', 'DAYS_15', 'DAYS_30', 'DAYS_60', 'DAYS_90']).nullable().optional(),
  expectedSalary: z.string().nullable().optional(),
});

export const UpdateCandidateProfileSchema = z.object({
  headline: z.string().max(255).nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  yearsOfExperience: z.number().int().min(0).max(50).nullable().optional(),
  isOpenToWork: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  // Optimistic concurrency check
  updatedAt: z.string().datetime().optional(),
});

export const UpdateCandidateGraphSchema = z.object({
  profile: UpdateCandidateProfileSchema,
  skills: z.array(CandidateSkillSchema).max(20).optional(),
  experiences: z.array(CandidateExperienceSchema).max(20).optional(),
  educations: z.array(CandidateEducationSchema).max(10).optional(),
  certificates: z.array(CandidateCertificateSchema).max(20).optional(),
  socials: z.array(CandidateSocialSchema).max(10).optional(),
  preferences: CandidatePreferenceSchema.optional(),
});

export type UpdateCandidateGraphDto = z.infer<typeof UpdateCandidateGraphSchema>;
export type UpdateCandidateProfileDto = z.infer<typeof UpdateCandidateProfileSchema>;
