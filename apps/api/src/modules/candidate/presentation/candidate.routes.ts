import { Role, UpdateCandidateProfileSchema } from '@microintern/shared';
import { Router } from 'express';
import multer from 'multer';

import { getContainer } from '@/core/container.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireRole } from '@/middleware/rbac.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';

import { getStorageService } from '@/infrastructure/storage/StorageService.js';
import { queues } from '@/infrastructure/queue/queues.js';
import { GetProfileUseCase } from '../application/use-cases/get-profile.usecase.js';
import { UpdateProfileUseCase } from '../application/use-cases/update-profile.usecase.js';
import { CalculateCompletionUseCase } from '../application/use-cases/calculate-completion.usecase.js';
import { UploadAvatarUseCase } from '../application/use-cases/upload-avatar.usecase.js';
import { UploadResumeUseCase } from '../application/use-cases/upload-resume.usecase.js';
import { GetResumeUrlUseCase } from '../application/use-cases/get-resume-url.usecase.js';
import { CandidateController } from './candidate.controller.js';
import type { RequestHandler } from 'express';

export function createCandidateRouter(): Router {
  const container = getContainer();

  try {
    container.get('CandidateController');
  } catch {
    container.register('GetProfileUseCase', (infra) => new GetProfileUseCase(infra.db));
    container.register('UpdateProfileUseCase', (infra) => new UpdateProfileUseCase(infra.db, container.get('CalculateCompletionUseCase')));
    container.register('CalculateCompletionUseCase', (infra) => new CalculateCompletionUseCase(infra.db));
    container.register('UploadAvatarUseCase', (infra) => new UploadAvatarUseCase(infra.db, getStorageService(), container.get('CalculateCompletionUseCase')));
    container.register('UploadResumeUseCase', (infra) => new UploadResumeUseCase(infra.db, getStorageService(), container.get('CalculateCompletionUseCase'), queues.resumeParser));
    container.register('GetResumeUrlUseCase', (infra) => new GetResumeUrlUseCase(infra.db, getStorageService()));

    container.register('CandidateController', () => new CandidateController(
      container.get('GetProfileUseCase'),
      container.get('UpdateProfileUseCase'),
      container.get('UploadAvatarUseCase'),
      container.get('UploadResumeUseCase'),
      container.get('GetResumeUrlUseCase')
    ));
  }

  const controller = container.get<CandidateController>('CandidateController');


  const uploadAvatar = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }).single('avatar');

  const uploadResume = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }).single('resume');

  const candidateRouter = Router();

  // GET /candidates/me
  candidateRouter.get(
    '/me',
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    (req, res, next) => { controller.getProfile(req, res).catch(next); },
  );

  // PUT /candidates/me
  candidateRouter.put(
    '/me',
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    validate('body', UpdateCandidateProfileSchema),
    (req, res, next) => { controller.updateProfile(req, res).catch(next); },
  );

  // POST /candidates/me/avatar
  candidateRouter.post(
    '/me/avatar',
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    uploadAvatar,
    (req, res, next) => { controller.uploadAvatar(req, res).catch(next); },
  );

  // POST /candidates/me/resume
  candidateRouter.post(
    '/me/resume',
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    uploadResume,
    (req, res, next) => { controller.uploadResume(req, res).catch(next); },
  );

  // GET /candidates/me/resume/url
  candidateRouter.get(
    '/me/resume/url',
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    (req, res, next) => { controller.getResumeUrl(req, res).catch(next); },
  );

  return candidateRouter;
}
