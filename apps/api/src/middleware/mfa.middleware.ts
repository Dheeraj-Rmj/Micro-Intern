import jwt from 'jsonwebtoken';

import { config } from '@/core/config.js';
import { UnauthorizedError } from '@/shared/errors/index.js';
import { extractBearerToken } from './auth.middleware.js';

import type { Request, Response, NextFunction } from 'express';

export async function requireMfaToken(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractBearerToken(req);

    if (token === null) {
      throw new UnauthorizedError('MFA token required', 'AUTH_TOKEN_INVALID');
    }

    let payload: any;
    try {
      payload = jwt.verify(token, config.JWT_ACCESS_SECRET, {
        issuer: config.JWT_ISSUER,
        audience: config.JWT_AUDIENCE,
        algorithms: ['HS256'],
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('MFA token expired', 'AUTH_TOKEN_EXPIRED');
      }
      throw new UnauthorizedError('Invalid MFA token', 'AUTH_TOKEN_INVALID');
    }

    if (payload.type !== 'mfa_pending') {
      throw new UnauthorizedError('Invalid token type for this operation', 'AUTH_TOKEN_INVALID');
    }

    if (!payload.sub) {
      throw new UnauthorizedError('Invalid MFA token payload', 'AUTH_TOKEN_INVALID');
    }

    req.user = {
      id: payload.sub,
    } as any;

    next();
  } catch (error) {
    next(error);
  }
}
