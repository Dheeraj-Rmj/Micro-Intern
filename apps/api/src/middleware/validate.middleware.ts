import { ValidationError } from '@/shared/errors/index.js';

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';


type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 *
 * Design: Middleware validates request data against a Zod schema and replaces
 * the request data with the parsed (transformed) output. This ensures that by
 * the time a controller reads req.body, the data is already typed, transformed,
 * and validated — no additional guards needed in business logic.
 *
 * Validation errors are thrown as ValidationError (422) with field-level details.
 * This ensures consistent error format regardless of which endpoint fails.
 *
 * @example
 * router.post('/register',
 *   validate('body', RegisterSchema),
 *   authController.register,
 * );
 */
export function validate<T>(target: ValidationTarget, schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = formatZodErrors(result.error);
      next(new ValidationError('Request validation failed', details));
      return;
    }

    // Replace request data with parsed output (applies Zod transforms)
    (req[target] as unknown) = result.data;
    next();
  };
}

/**
 * Format Zod validation errors into the API error detail format.
 */
function formatZodErrors(error: ZodError): Record<string, unknown>[] {
  return error.issues.map((issue) => ({
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    field: issue.path.join('.') || 'root',
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Validate multiple targets at once.
 * Order: params → query → body (least to most specific).
 *
 * @example
 * router.get('/:id',
 *   validateAll({
 *     params: ParamsSchema,
 *     query: ListQuerySchema,
 *   }),
 *   controller.list,
 * );
 */
export function validateAll(schemas: Partial<Record<ValidationTarget, ZodSchema>>): (
  req: Request,
  res: Response,
  next: NextFunction,
) => void {
  const validationOrder: ValidationTarget[] = ['params', 'query', 'body'];

  return (req: Request, res: Response, next: NextFunction): void => {
    for (const target of validationOrder) {
      const schema = schemas[target];
      if (schema === undefined) continue;

      const result = schema.safeParse(req[target]);
      if (!result.success) {
        const details = formatZodErrors(result.error);
        next(new ValidationError(`Validation failed for ${target}`, details));
        return;
      }
      (req[target] as unknown) = result.data;
    }
    next();
  };
}
