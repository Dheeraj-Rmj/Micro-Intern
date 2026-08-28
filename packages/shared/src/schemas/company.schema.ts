import { z } from "zod";

import { CompanySize } from "../enums/status.enum.js";
import { EmailSchema, UrlSchema } from "./common.schema.js";

/**
 * Validation schema for creating a new company.
 */
export const CreateCompanySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Company name must be at least 2 characters" })
      .max(255),
    websiteUrl: UrlSchema,
    website: UrlSchema, // Alias for websiteUrl
    description: z.string().max(2000).nullable().optional(),
    industry: z.string().max(100).nullable().optional(),
    size: z.nativeEnum(CompanySize).nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    linkedinUrl: UrlSchema,
  })
  .partial({
    websiteUrl: true,
    website: true,
    description: true,
    industry: true,
    size: true,
    location: true,
    linkedinUrl: true,
  });

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;

/**
 * Validation schema for updating company profile settings.
 */
export const UpdateCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Company name must be at least 2 characters" })
    .max(255)
    .optional(),
  websiteUrl: UrlSchema,
  website: UrlSchema,
  description: z.string().max(2000).nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  size: z.nativeEnum(CompanySize).nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  linkedinUrl: UrlSchema,
  logoUrl: UrlSchema,
});

export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;

/**
 * Validation schema for inviting a recruiter to the team.
 */
export const InviteTeamMemberSchema = z.object({
  email: EmailSchema,
  name: z.string().min(1, "Name is required").optional(),
  role: z.string().optional(),
});

export type InviteTeamMemberInput = z.infer<typeof InviteTeamMemberSchema>;
