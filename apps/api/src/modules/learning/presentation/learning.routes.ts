import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { GenerateLearningRecommendationsUseCase } from "../application/GenerateLearningRecommendationsUseCase.js";
import { LearningController } from "./learning.controller.js";
import { PrismaRoleProfileRepository } from "@/modules/skill-framework/infrastructure/PrismaRoleProfileRepository.js";
import { PrismaSkillVerificationRepository } from "@/modules/skill-verification/infrastructure/PrismaSkillVerificationRepository.js";
import { PrismaSkillRepository } from "@/modules/skill-framework/infrastructure/PrismaSkillRepository.js";
import type { InfrastructureDependencies } from "@/core/container.js";

export function registerLearningModuleDependencies(): void {
  const container = getContainer();

  try {
    container.get("GenerateLearningRecommendationsUseCase");
  } catch {
    container.register(
      "GenerateLearningRecommendationsUseCase",
      (infra: InfrastructureDependencies) => {
        const roleRepo = new PrismaRoleProfileRepository(infra.db);
        const verRepo = new PrismaSkillVerificationRepository(infra.db);
        const skillRepo = new PrismaSkillRepository(infra.db);
        return new GenerateLearningRecommendationsUseCase(roleRepo, verRepo, skillRepo);
      },
    );

    container.register("LearningController", () => {
      return new LearningController(container.get("GenerateLearningRecommendationsUseCase"));
    });
  }
}

export function createLearningRoutes(): Router {
  registerLearningModuleDependencies();
  const container = getContainer();
  const controller = container.get<LearningController>("LearningController");

  const router = Router();

  router.get("/", authMiddleware, controller.getRecommendations);

  return router;
}
