import { Router } from 'express';

import { createAuthRouter } from '@/modules/auth/presentation/auth.routes.js';
import { createCandidateRouter } from '@/modules/candidate/presentation/candidate.routes.js';

export function createV1Router(): Router {
  const v1Router = Router();

  v1Router.use('/auth', createAuthRouter());
  v1Router.use('/candidates', createCandidateRouter());

  return v1Router;
}
