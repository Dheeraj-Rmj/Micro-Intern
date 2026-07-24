import { Router } from 'express';

/**
 * API v1 Router.
 *
 * All feature module routers mount here.
 * Each module registers its own sub-router.
 *
 * Convention:
 * - Routes are prefixed with their domain: /auth, /users, /companies, etc.
 * - Module routers are imported and mounted by feature teams
 * - This file only orchestrates — no business logic here
 */
const v1Router: Router = Router();

// ── Auth ─────────────────────────────────────────────────────────────────────
// Mounted by: apps/api/src/modules/auth/presentation/auth.routes.ts
// import { authRouter } from '@/modules/auth/presentation/auth.routes.js';
// v1Router.use('/auth', authRouter);

// ── Users ─────────────────────────────────────────────────────────────────────
// import { userRouter } from '@/modules/user/presentation/user.routes.js';
// v1Router.use('/users', userRouter);

// ── Candidates ────────────────────────────────────────────────────────────────
// import { candidateRouter } from '@/modules/candidate/presentation/candidate.routes.js';
// v1Router.use('/candidates', candidateRouter);

// ── Companies ─────────────────────────────────────────────────────────────────
// import { companyRouter } from '@/modules/company/presentation/company.routes.js';
// v1Router.use('/companies', companyRouter);

// ── Trials ────────────────────────────────────────────────────────────────────
// import { trialRouter } from '@/modules/trial/presentation/trial.routes.js';
// v1Router.use('/trials', trialRouter);

// ── Evaluations ───────────────────────────────────────────────────────────────
// import { evaluationRouter } from '@/modules/evaluation/presentation/evaluation.routes.js';
// v1Router.use('/evaluations', evaluationRouter);

// ── Pipelines ─────────────────────────────────────────────────────────────────
// import { pipelineRouter } from '@/modules/pipeline/presentation/pipeline.routes.js';
// v1Router.use('/pipelines', pipelineRouter);

// ── Admin ─────────────────────────────────────────────────────────────────────
// import { adminRouter } from '@/modules/admin/presentation/admin.routes.js';
// v1Router.use('/admin', adminRouter);

export { v1Router };
