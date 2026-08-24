import { z } from "zod";

/**
 * Offset-based pagination query schema.
 * Used for most list endpoints where total count is acceptable.
 */
export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .refine((n) => n >= 1, { message: "Page must be >= 1" }),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100, { message: "Limit must be between 1 and 100" }),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

/**
 * Cursor-based pagination query schema.
 * Preferred for feeds and real-time data.
 */
export const CursorPaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100, { message: "Limit must be between 1 and 100" }),
  direction: z.enum(["forward", "backward"]).optional().default("forward"),
});

export type CursorPaginationQuery = z.infer<typeof CursorPaginationQuerySchema>;

/**
 * Sorting query schema.
 * Sort format: `field` (ASC) or `-field` (DESC). Multiple fields comma-separated.
 * Example: `-createdAt,name`
 */
export const SortQuerySchema = z.object({
  sort: z
    .string()
    .optional()
    .transform((sort) => {
      if (sort === undefined) return undefined;
      return sort.split(",").map((field) => {
        const direction = field.startsWith("-") ? "desc" : "asc";
        const column = field.replace(/^-/, "");
        return { column, direction } as const;
      });
    }),
});

export type SortQuery = z.infer<typeof SortQuerySchema>;

/**
 * Search query schema.
 */
export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(255).optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

/**
 * Combined list query schema.
 * Extend this in domain-specific list endpoints to add filter fields.
 */
export const ListQuerySchema =
  PaginationQuerySchema.merge(SortQuerySchema).merge(SearchQuerySchema);

export type ListQuery = z.infer<typeof ListQuerySchema>;
