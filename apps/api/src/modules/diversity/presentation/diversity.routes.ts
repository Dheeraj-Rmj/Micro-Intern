import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { requireAnyRole } from "@/middleware/rbac.middleware.js";
import { Role } from "@microintern/shared";
import { DiversityAnalyticsService } from "../application/DiversityAnalyticsService.js";
import { DiversityController } from "./diversity.controller.js";
import type { InfrastructureDependencies } from "@/core/container.js";

function registerDiversityDeps(): void {
  const container = getContainer();
  try {
    container.get("DiversityService");
  } catch {
    container.register(
      "DiversityService",
      (infra: InfrastructureDependencies) => new DiversityAnalyticsService(infra.db),
    );
    container.register(
      "DiversityController",
      () => new DiversityController(container.get("DiversityService")),
    );
  }
}

export function createDiversityRoutes(): Router {
  registerDiversityDeps();
  const container = getContainer();
  const ctrl = container.get<DiversityController>("DiversityController");
  const router = Router();

  // Candidate voluntarily submits their diversity data
  router.post("/submit", authMiddleware, ctrl.submitData);

  // Recruiters/admins view anonymized reports
  router.get(
    "/company-report",
    authMiddleware,
    requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]),
    ctrl.getCompanyReport,
  );
  router.get(
    "/platform-report",
    authMiddleware,
    requireAnyRole([Role.SUPER_ADMIN, Role.ADMIN]),
    ctrl.getPlatformReport,
  );

  return router;
}
