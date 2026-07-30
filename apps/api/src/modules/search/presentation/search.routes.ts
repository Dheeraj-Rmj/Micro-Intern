import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { SearchEngineService } from "../application/SearchEngineService.js";
import { SearchController } from "./search.controller.js";
import type { InfrastructureDependencies } from "@/core/container.js";

export function registerSearchModuleDependencies(): void {
  const container = getContainer();

  try {
    container.get("SearchEngineService");
  } catch {
    container.register("SearchEngineService", (infra: InfrastructureDependencies) => {
      return new SearchEngineService(infra.db);
    });

    container.register("SearchController", () => {
      return new SearchController(container.get("SearchEngineService"));
    });
  }
}

export function createSearchRoutes(): Router {
  registerSearchModuleDependencies();
  const container = getContainer();
  const controller = container.get<SearchController>("SearchController");

  const router = Router();

  router.get("/skills", controller.searchSkills);
  router.get("/role-profiles", controller.searchRoleProfiles);
  router.get("/evidence", controller.searchEvidence);
  router.get("/portfolios", controller.searchPortfolios);

  return router;
}
