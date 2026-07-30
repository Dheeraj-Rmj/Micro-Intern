import { Role, AuditAction } from "@microintern/shared";
import { Router } from "express";

import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";

import { registerSubmissionModuleDependencies } from "@/modules/submission/presentation/submission.routes.js";
import { GetSubmissionEvaluationUseCase } from "../application/use-cases/get-submission-evaluation.usecase.js";
import { PrismaEvaluationRepository } from "../infrastructure/repositories/PrismaEvaluationRepository.js";
import { EvaluationController } from "./evaluation.controller.js";
import { SubmissionParamSchema } from "./evaluation.schemas.js";

import type { InfrastructureDependencies } from "@/core/container.js";
import type { RequestHandler } from "express";

export function registerEvaluationModuleDependencies(): void {
  const container = getContainer();

  // Ensure Submission dependencies are available
  registerSubmissionModuleDependencies();

  try {
    container.get("IEvaluationRepository");
  } catch {
    container.register(
      "IEvaluationRepository",
      (_infra: InfrastructureDependencies) => new PrismaEvaluationRepository(_infra.db),
    );

    container.register(
      "GetSubmissionEvaluationUseCase",
      () =>
        new GetSubmissionEvaluationUseCase(
          container.get("ISubmissionRepository"),
          container.get("IEvaluationRepository"),
          container.get("GetProfileUseCase"),
        ),
    );

    container.register(
      "EvaluationController",
      () => new EvaluationController(container.get("GetSubmissionEvaluationUseCase")),
    );
  }
}

export function createEvaluationRouter(): Router {
  registerEvaluationModuleDependencies();
  const container = getContainer();
  const controller = container.get<EvaluationController>("EvaluationController");
  const router = Router();

  // GET /api/v1/submissions/:id/evaluation - Fetch AI grading results
  router.get(
    "/:id/evaluation" as unknown as string,
    authMiddleware as RequestHandler,
    validate("params", SubmissionParamSchema),
    (req, res, next) => {
      controller.getSubmissionEvaluation(req, res, next).catch(next);
    },
  );

  return router;
}
