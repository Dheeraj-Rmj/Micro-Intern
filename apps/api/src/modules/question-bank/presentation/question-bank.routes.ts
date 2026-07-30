import { Router } from 'express';
import { getContainer } from '@/core/container.js';
import { authMiddleware } from '@/middleware/auth.middleware.js';
import { requireAnyRole } from '@/middleware/rbac.middleware.js';
import { Role } from '@microintern/shared';
import { QuestionBankService } from '../application/QuestionBankService.js';
import { QuestionBankController } from './question-bank.controller.js';
import type { InfrastructureDependencies } from '@/core/container.js';

function registerQuestionBankDeps(): void {
  const container = getContainer();
  try { container.get('QuestionBankService'); } catch {
    container.register('QuestionBankService', (infra: InfrastructureDependencies) =>
      new QuestionBankService(infra.db, infra.aiEngine),
    );
    container.register('QuestionBankController', () =>
      new QuestionBankController(container.get('QuestionBankService')),
    );
  }
}

export function createQuestionBankRoutes(): Router {
  registerQuestionBankDeps();
  const container = getContainer();
  const ctrl = container.get<QuestionBankController>('QuestionBankController');
  const router = Router();

  router.get('/', authMiddleware, requireAnyRole([Role.RECRUITER, Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.listQuestions);
  router.post('/', authMiddleware, requireAnyRole([Role.RECRUITER, Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.createQuestion);
  router.post('/generate', authMiddleware, requireAnyRole([Role.RECRUITER, Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.generateQuestions);
  router.delete('/:id', authMiddleware, requireAnyRole([Role.RECRUITER, Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]), ctrl.deleteQuestion);

  return router;
}
