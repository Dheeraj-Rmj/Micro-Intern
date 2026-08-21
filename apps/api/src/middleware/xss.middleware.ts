import xss from 'xss';
import type { Request, Response, NextFunction } from 'express';

// Configure XSS sanitizer options
// By default, xss() strips all tags unless explicitly whitelisted.
// Since this is an API, we generally expect plain text, UUIDs, or JSON, not HTML.
// If specific fields need HTML (like rich text job descriptions), 
// they should be handled in route-specific middleware, but globally we sanitize everything.
const xssOptions = {
  whiteList: {}, // Empty whitelist means NO HTML tags are allowed
  stripIgnoreTag: true, // completely remove tags that aren't in whitelist
  stripIgnoreTagBody: ['script', 'style'], // remove the contents of <script> and <style>
};
// No need to instantiate FilterXSS, we can just use the xss() function directly

/**
 * Recursively sanitize an object or array to prevent XSS.
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return xss(obj, xssOptions);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Don't sanitize keys, only values
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj;
  }

  return obj; // numbers, booleans, etc.
}

/**
 * Global XSS Sanitization Middleware.
 * 
 * Recursively sanitizes req.body, req.query, and req.params, neutralizing any 
 * potentially malicious HTML/JS payloads before they hit the route controllers.
 */
export function xssSanitizerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
}
