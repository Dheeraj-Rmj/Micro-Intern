import { z } from "zod";

/**
 * Email validation — used across registration, invitation, and notification schemas.
 */
export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: "Invalid email address" });

/**
 * Password validation — enforces enterprise password policy.
 * Minimum 8 chars, at least one uppercase, one lowercase, one digit, one special char.
 */
export const PasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(128, { message: "Password must not exceed 128 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" });

/**
 * Phone number validation — E.164 format.
 */
export const PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, { message: "Phone must be in E.164 format (e.g. +14155552671)" })
  .optional();

/**
 * URL validation.
 */
export const UrlSchema = z.string().url({ message: "Invalid URL" }).optional();

/**
 * Slug validation — kebab-case alphanumeric.
 */
export const SlugSchema = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug must be kebab-case alphanumeric" });

/**
 * UUID schema.
 */
export const UuidSchema = z.string().uuid({ message: "Invalid UUID" });

/**
 * Pagination input (before transform) — for frontend query builders.
 */
export const PaginationInputSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type PaginationInput = z.infer<typeof PaginationInputSchema>;

/**
 * Name validation — used for first/last name, company name, etc.
 */
export const NameSchema = z.string().min(1).max(100).trim();

/**
 * Long text validation — for descriptions, bios, etc.
 */
export const LongTextSchema = z.string().max(5000).trim().optional();

/**
 * Short text validation — for titles, short labels.
 */
export const ShortTextSchema = z.string().min(1).max(255).trim();
