import { BadRequestError } from '@/shared/errors/index.js';
import type { Request, Response, NextFunction } from 'express';

/**
 * Strict Content-Type validation middleware.
 * 
 * Mitigates XXE (XML External Entity) injections and unknown payload parsing 
 * by explicitly dropping requests with unsupported Media Types.
 * 
 * Allowed types:
 * - application/json
 * - application/x-www-form-urlencoded
 * - multipart/form-data
 */
export function strictContentTypeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // Only apply to requests that carry a payload
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];

    if (!contentType) {
      return next(); // Empty bodies are handled by body-parsers/schema validation
    }

    const type = contentType.split(';')[0]?.trim().toLowerCase();

    // Explicitly block XML
    if (type === 'application/xml' || type === 'text/xml') {
      return next(new BadRequestError('XML payloads are strictly forbidden to prevent XXE.'));
    }

    // Allow only safe, expected types
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
    ];

    if (type && !allowedTypes.includes(type)) {
      return next(new BadRequestError(`Unsupported Content-Type: ${type}`));
    }
  }

  next();
}
