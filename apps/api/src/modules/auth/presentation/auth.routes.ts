import { AuditAction } from '@microintern/shared';
import { Router } from 'express';

import { getContainer } from '@/core/container.js';
import { audit } from '@/middleware/audit.middleware.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { authRateLimiter } from '@/middleware/ratelimit.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';

import {
  LoginSchema,
  RegisterCandidateSchema,
  RefreshTokenSchema,
} from '../application/dtos/auth.dto.js';

import type { AuthController } from './auth.controller.js';

/**
 * Auth router factory.
 * Creates controller with dependencies from container.
 */
export function createAuthRouter(): Router {
  const container = getContainer();
  const controller = container.get<AuthController>('AuthController');

  const router = Router();

  // POST /auth/register/candidate
  router.post(
    '/register/candidate',
    authRateLimiter,
    validate('body', RegisterCandidateSchema),
    audit(AuditAction.REGISTER, 'User'),
    (req, res, next) => { controller.registerCandidate(req, res, next).catch(next); },
  );

  // POST /auth/login
  router.post(
    '/login',
    authRateLimiter,
    validate('body', LoginSchema),
    audit(AuditAction.LOGIN, 'User'),
    (req, res, next) => { controller.login(req, res, next).catch(next); },
  );

  // POST /auth/refresh
  router.post(
    '/refresh',
    validate('body', RefreshTokenSchema),
    (req, res, next) => { controller.refreshToken(req, res, next).catch(next); },
  );

  // POST /auth/logout
  router.post(
    '/logout',
    authMiddleware,
    audit(AuditAction.LOGOUT, 'User'),
    (req, res, next) => { controller.logout(req, res, next).catch(next); },
  );

  // GET /auth/me
  router.get(
    '/me',
    authMiddleware,
    (req, res) => { controller.me(req, res); },
  );

  return router;
}
