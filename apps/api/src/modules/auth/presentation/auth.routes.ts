import { Router } from 'express';

import { AuthController } from './auth.controller.js';
import { validate } from '@/middleware/validate.middleware.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { authRateLimiter } from '@/middleware/ratelimit.middleware.js';
import { audit } from '@/middleware/audit.middleware.js';
import {
  LoginSchema,
  RegisterCandidateSchema,
  RefreshTokenSchema,
} from '../application/dtos/auth.dto.js';
import { getContainer } from '@/core/container.js';
import type { ApplicationContainer } from '@/core/container.js';

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
    audit('REGISTER', 'User'),
    (req, res, next) => { void controller.registerCandidate(req, res, next); },
  );

  // POST /auth/login
  router.post(
    '/login',
    authRateLimiter,
    validate('body', LoginSchema),
    audit('LOGIN', 'User'),
    (req, res, next) => { void controller.login(req, res, next); },
  );

  // POST /auth/refresh
  router.post(
    '/refresh',
    validate('body', RefreshTokenSchema),
    (req, res, next) => { void controller.refreshToken(req, res, next); },
  );

  // POST /auth/logout
  router.post(
    '/logout',
    authMiddleware,
    audit('LOGOUT', 'User'),
    (req, res, next) => { void controller.logout(req, res, next); },
  );

  // GET /auth/me
  router.get(
    '/me',
    authMiddleware,
    (req, res) => { controller.me(req, res); },
  );

  return router;
}
