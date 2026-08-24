import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { CandidateLeaderboardService } from "../application/CandidateLeaderboardService.js";
import { LeaderboardController } from "./leaderboard.controller.js";
import type { InfrastructureDependencies } from "@/core/container.js";

function registerLeaderboardDeps(): void {
  const container = getContainer();
  try {
    container.get("LeaderboardService");
  } catch {
    container.register(
      "LeaderboardService",
      (infra: InfrastructureDependencies) => new CandidateLeaderboardService(infra.db),
    );
    container.register(
      "LeaderboardController",
      () => new LeaderboardController(container.get("LeaderboardService")),
    );
  }
}

export function createLeaderboardRoutes(): Router {
  registerLeaderboardDeps();
  const container = getContainer();
  const ctrl = container.get<LeaderboardController>("LeaderboardController");
  const router = Router();

  router.get("/company", authMiddleware, ctrl.getCompanyLeaderboard);
  router.get("/role-profile/:roleProfileId", authMiddleware, ctrl.getRoleProfileLeaderboard);

  return router;
}
