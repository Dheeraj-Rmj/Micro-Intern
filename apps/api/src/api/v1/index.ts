import { Router } from 'express';

import { createAdminRouter } from '@/modules/admin/presentation/admin.routes.js';
import { createAuthRouter } from '@/modules/auth/presentation/auth.routes.js';
import { createCandidateRouter } from '@/modules/candidate/presentation/candidate.routes.js';
import { createCompanyRouter } from '@/modules/company/presentation/company.routes.js';
import { createSubmissionRouter, attachTrialEvaluationRoutes } from '@/modules/evaluation/presentation/evaluation.routes.js';
import { createNotificationRouter } from '@/modules/notification/presentation/notification.routes.js';
import { attachCompanyPipelineRoutes } from '@/modules/pipeline/presentation/pipeline.routes.js';
import { createTrialRouter } from '@/modules/trial/presentation/trial.routes.js';

export function createV1Router(): Router {
  const v1Router = Router();
  const trialRouter = createTrialRouter();
  attachTrialEvaluationRoutes(trialRouter);

  const companyRouter = createCompanyRouter();
  attachCompanyPipelineRoutes(companyRouter);

  v1Router.use('/auth', createAuthRouter());
  v1Router.use('/candidates', createCandidateRouter());
  v1Router.use('/companies', companyRouter);
  v1Router.use('/trials', trialRouter);
  v1Router.use('/submissions', createSubmissionRouter());
  v1Router.use('/admin', createAdminRouter());
  v1Router.use('/notifications', createNotificationRouter());

  return v1Router;
}

