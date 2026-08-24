import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { requireAnyRole } from "@/middleware/rbac.middleware.js";
import { Role } from "@microintern/shared";
import { SkillMatchingService } from "../application/SkillMatchingService.js";
import { MatchingController } from "./matching.controller.js";
import { PrismaRoleProfileRepository } from "@/modules/skill-framework/infrastructure/PrismaRoleProfileRepository.js";
import { PrismaSkillVerificationRepository } from "@/modules/skill-verification/infrastructure/PrismaSkillVerificationRepository.js";
import { PrismaEvidenceRepository } from "@/modules/evidence/infrastructure/PrismaEvidenceRepository.js";
import type { InfrastructureDependencies } from "@/core/container.js";

export function registerMatchingModuleDependencies(): void {
  const container = getContainer();

  try {
    container.get("SkillMatchingService");
  } catch {
    container.register("SkillMatchingService", (infra: InfrastructureDependencies) => {
      const roleRepo = new PrismaRoleProfileRepository(infra.db);
      const verRepo = new PrismaSkillVerificationRepository(infra.db);
      const evRepo = new PrismaEvidenceRepository(infra.db);
      return new SkillMatchingService(roleRepo, verRepo, evRepo);
    });

    container.register("MatchingController", () => {
      return new MatchingController(container.get("SkillMatchingService"));
    });
  }
}

export function createMatchingRoutes(): Router {
  registerMatchingModuleDependencies();
  const container = getContainer();
  const controller = container.get<MatchingController>("MatchingController");

  const router = Router();

  router.post(
    "/candidate",
    authMiddleware,
    requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN, Role.COMPANY_OWNER, Role.RECRUITER]),
    controller.matchCandidate,
  );
  router.post(
    "/rank",
    authMiddleware,
    requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN, Role.COMPANY_OWNER, Role.RECRUITER]),
    controller.rankCandidates,
  );

  return router;
}
