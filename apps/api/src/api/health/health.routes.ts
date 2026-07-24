import { Router } from 'express';

import { healthController } from './health.controller.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireRole } from '@/middleware/rbac.middleware.js';

const healthRouter = Router();

// Liveness — no auth, fastest possible response
healthRouter.get('/', (_req, res) => { void healthController.liveness(_req, res); });

// Readiness — no auth, used by load balancers
healthRouter.get('/ready', (_req, res) => { void healthController.readiness(_req, res); });

// Detailed — auth-protected, for monitoring dashboards only
healthRouter.get(
  '/detailed',
  authMiddleware,
  requireRole('ADMIN'),
  (_req, res) => { void healthController.detailed(_req, res); },
);

export { healthRouter };
