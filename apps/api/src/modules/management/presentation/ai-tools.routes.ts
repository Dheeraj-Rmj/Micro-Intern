import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { requireAnyRole } from "@/middleware/rbac.middleware.js";
import { Role } from "@microintern/shared";
import { JobDescriptionService } from "../application/use-cases/GenerateJobDescriptionUseCase.js";
import { GenerateOfferLetterUseCase } from "../application/use-cases/GenerateOfferLetterUseCase.js";
import { AIToolsController } from "./ai-tools.controller.js";
import type { InfrastructureDependencies } from "@/core/container.js";

function registerAIToolsDeps(): void {
  const container = getContainer();
  try {
    container.get("AIToolsController");
  } catch {
    container.register(
      "JobDescriptionService",
      (infra: InfrastructureDependencies) => new JobDescriptionService(infra.db, infra.aiEngine),
    );
    container.register(
      "GenerateOfferLetterUseCase",
      (infra: InfrastructureDependencies) => new GenerateOfferLetterUseCase(infra.aiEngine),
    );
    container.register(
      "AIToolsController",
      () =>
        new AIToolsController(
          container.get("JobDescriptionService"),
          container.get("GenerateOfferLetterUseCase"),
        ),
    );
  }
}

export function createAIToolsRouter(): Router {
  registerAIToolsDeps();
  const container = getContainer();
  const ctrl = container.get<AIToolsController>("AIToolsController");
  const router = Router();

  // POST /api/v1/ai-tools/job-description
  router.post(
    "/job-description",
    authMiddleware,
    requireAnyRole([Role.RECRUITER, Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]),
    ctrl.generateJobDescription,
  );

  // POST /api/v1/ai-tools/offer-letter
  router.post(
    "/offer-letter",
    authMiddleware,
    requireAnyRole([Role.RECRUITER, Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]),
    ctrl.generateOfferLetter,
  );

  return router;
}
