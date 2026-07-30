import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { PrismaPortfolioRepository } from "../infrastructure/PrismaPortfolioRepository.js";
import { PortfolioService } from "../application/PortfolioService.js";
import { PortfolioController } from "./portfolio.controller.js";
import { PublicProfileController } from "./public-profile.controller.js";
import type { InfrastructureDependencies } from "@/core/container.js";

export function registerPortfolioModuleDependencies(): void {
  const container = getContainer();

  try {
    container.get("IPortfolioRepository");
  } catch {
    container.register("IPortfolioRepository", (infra: InfrastructureDependencies) => {
      return new PrismaPortfolioRepository(infra.db);
    });

    container.register("PortfolioService", () => {
      return new PortfolioService(container.get("IPortfolioRepository"));
    });

    container.register("PortfolioController", () => {
      return new PortfolioController(container.get("PortfolioService"));
    });

    container.register("PublicProfileController", () => {
      return new PublicProfileController(container.get("PortfolioService"));
    });
  }
}

export function createPortfolioRoutes(): Router {
  registerPortfolioModuleDependencies();
  const container = getContainer();
  const controller = container.get<PortfolioController>("PortfolioController");

  const router = Router();

  router.get("/me", authMiddleware, controller.getMyPortfolio);
  router.put("/me", authMiddleware, controller.updateMyPortfolio);
  router.post("/me/projects", authMiddleware, controller.addProject);
  router.post("/me/achievements", authMiddleware, controller.addAchievement);
  router.get("/me/timeline", authMiddleware, controller.getTimeline);

  return router;
}
