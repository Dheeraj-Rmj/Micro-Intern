import { Router } from 'express';
import { getContainer } from '@/core/container.js';
import { registerPortfolioModuleDependencies } from './portfolio.routes.js';
import type { PublicProfileController } from './public-profile.controller.js';

export function createPublicProfileRoutes(): Router {
  registerPortfolioModuleDependencies();
  const container = getContainer();
  const controller = container.get<PublicProfileController>('PublicProfileController');

  const router = Router();

  router.get('/:slug', controller.getPublicProfileBySlug);

  return router;
}
