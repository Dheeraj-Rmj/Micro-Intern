import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { requireAnyRole } from "@/middleware/rbac.middleware.js";
import { Role } from "@microintern/shared";
import { PrismaSkillVerificationRepository } from "../infrastructure/PrismaSkillVerificationRepository.js";
import { SkillVerificationService } from "../application/SkillVerificationService.js";
import { SkillVerificationController } from "./skill-verification.controller.js";
import type { InfrastructureDependencies } from "@/core/container.js";

export function registerSkillVerificationModuleDependencies(): void {
  const container = getContainer();

  try {
    container.get("ISkillVerificationRepository");
  } catch {
    container.register("ISkillVerificationRepository", (infra: InfrastructureDependencies) => {
      return new PrismaSkillVerificationRepository(infra.db);
    });

    container.register("SkillVerificationService", () => {
      return new SkillVerificationService(container.get("ISkillVerificationRepository"));
    });

    container.register("SkillVerificationController", () => {
      return new SkillVerificationController(container.get("SkillVerificationService"));
    });
  }
}

export function createSkillVerificationRoutes(): Router {
  registerSkillVerificationModuleDependencies();
  const container = getContainer();
  const controller = container.get<SkillVerificationController>("SkillVerificationController");

  const router = Router();

  router.post(
    "/verify",
    authMiddleware,
    requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN, Role.COMPANY_OWNER, Role.RECRUITER]),
    controller.verifySkill,
  );
  router.get("/candidate/:candidateId", authMiddleware, controller.getCandidateVerifiedSkills);
  router.get(
    "/candidate/:candidateId/skill/:skillId",
    authMiddleware,
    controller.getSkillVerification,
  );

  return router;
}
