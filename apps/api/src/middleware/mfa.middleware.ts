import jwt from 'jsonwebtoken';

import { config } from '@/core/config.js';
import { UnauthorizedError } from '@/shared/errors/index.js';
import { extractBearerToken } from './auth.middleware.js';
import { prisma } from '@/core/database.js';
import { authenticator } from 'otplib';

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

/**
 * Step-Up MFA Authentication
 * For highly sensitive endpoints, require a fresh TOTP code to be passed in the `x-mfa-totp` header.
 * This defeats session hijacking since the attacker doesn't have the user's authenticator app.
 */
export async function requireFreshMfa(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('User must be authenticated for step-up MFA', 'AUTH_TOKEN_INVALID');
    }

    const mfaCode = req.headers['x-mfa-totp'] as string;
    if (!mfaCode) {
      // 403 Forbidden with a specific code so frontend knows to show an MFA prompt
      res.status(403).json({
        success: false,
        error: {
          code: 'MFA_REQUIRED',
          message: 'This action requires a fresh MFA code. Please provide it in the x-mfa-totp header.'
        }
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.totpSecret || !user.mfaEnabled) {
      // If user doesn't have MFA enabled, either block the sensitive action completely,
      // or allow it. In a zero-trust model, we require them to set up MFA first.
      res.status(403).json({
        success: false,
        error: {
          code: 'MFA_NOT_SETUP',
          message: 'You must have MFA enabled on your account to perform this sensitive action.'
        }
      });
      return;
    }

    const isValid = authenticator.verify({ token: mfaCode, secret: user.totpSecret });
    if (!isValid) {
      throw new UnauthorizedError('Invalid MFA code provided for step-up authentication', 'AUTH_TOKEN_INVALID');
    }

    next();
  } catch (error) {
    next(error);
  }
}
