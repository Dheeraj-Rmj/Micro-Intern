import { Role, AuditAction } from "@microintern/shared";
import { Router } from "express";
import multer from "multer";

import { getContainer } from "@/core/container.js";
import { audit } from "@/middleware/audit.middleware.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { requireRole } from "@/middleware/rbac.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import { registerAssessmentModuleDependencies } from "@/modules/assessment/presentation/assessment.routes.js";
import { GetProfileUseCase } from "@/modules/candidate/application/use-cases/get-profile.usecase.js";

import { PrismaSubmissionRepository } from "../infrastructure/repositories/PrismaSubmissionRepository.js";
import { StartAssessmentUseCase } from "../application/use-cases/start-assessment.usecase.js";
import { SubmitAssessmentUseCase } from "../application/use-cases/submit-assessment.usecase.js";
import { ListCandidateSubmissionsUseCase } from "../application/use-cases/list-candidate-submissions.usecase.js";
import { SubmissionController } from "./submission.controller.js";
import {
  AssessmentParamSchema,
  PaginationQuerySchema,
  SubmitAssessmentBodySchema,
} from "../../evaluation/presentation/evaluation.schemas.js";

import type { InfrastructureDependencies } from "@/core/container.js";
import type { RequestHandler } from "express";

const uploadSolutions = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
}).array("files");

export function registerSubmissionModuleDependencies(): void {
  const container = getContainer();
  registerAssessmentModuleDependencies();

  try {
    container.get("GetProfileUseCase");
  } catch {
    container.register(
      "GetProfileUseCase",
      (_infra: InfrastructureDependencies) => new GetProfileUseCase(_infra.db),
    );
  }

  try {
    container.get("ISubmissionRepository");
  } catch {
    container.register(
      "ISubmissionRepository",
      (_infra: InfrastructureDependencies) => new PrismaSubmissionRepository(_infra.db),
    );
  }

  try {
    container.get("StartAssessmentUseCase");
  } catch {
    container.register(
      "StartAssessmentUseCase",
      () =>
        new StartAssessmentUseCase(
          container.get("ISubmissionRepository"),
          container.get("IAssessmentRepository"),
          container.get("GetProfileUseCase"),
        ),
    );

    container.register(
      "SubmitAssessmentUseCase",
      () =>
        new SubmitAssessmentUseCase(
          container.get("ISubmissionRepository"),
          container.get("GetProfileUseCase"),
        ),
    );

    container.register(
      "ListCandidateSubmissionsUseCase",
      () =>
        new ListCandidateSubmissionsUseCase(
          container.get("ISubmissionRepository"),
          container.get("GetProfileUseCase"),
        ),
    );

    container.register(
      "SubmissionController",
      () =>
        new SubmissionController(
          container.get("StartAssessmentUseCase"),
          container.get("SubmitAssessmentUseCase"),
          container.get("ListCandidateSubmissionsUseCase"),
        ),
    );
  }
}

export function createSubmissionRouter(): Router {
  registerSubmissionModuleDependencies();
  const container = getContainer();
  const controller = container.get<SubmissionController>("SubmissionController");
  const router = Router();

  router.get(
    "/me",
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    validate("query", PaginationQuerySchema),
    (req, res, next) => {
      controller.listCandidateSubmissions(req, res, next).catch(next);
    },
  );

  return router;
}

export function attachAssessmentSubmissionRoutes(assessmentRouter: Router): void {
  registerSubmissionModuleDependencies();
  const container = getContainer();
  const controller = container.get<SubmissionController>("SubmissionController");

  assessmentRouter.post(
    "/:id/start" as unknown as string,
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    validate("params", AssessmentParamSchema),
    audit(AuditAction.CREATE, "Submission") as RequestHandler,
    (req, res, next) => {
      controller.startAssessment(req, res, next).catch(next);
    },
  );

  assessmentRouter.post(
    "/:id/submit" as unknown as string,
    authMiddleware as RequestHandler,
    requireRole(Role.CANDIDATE) as RequestHandler,
    uploadSolutions,
    validate("params", AssessmentParamSchema),
    validate("body", SubmitAssessmentBodySchema),
    audit(AuditAction.UPDATE, "Submission") as RequestHandler,
    (req, res, next) => {
      controller.submitAssessment(req, res, next).catch(next);
    },
  );
}
