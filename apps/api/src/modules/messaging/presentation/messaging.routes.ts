import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { MessagingService } from "../application/MessagingService.js";
import { MessagingController } from "./messaging.controller.js";
import type { InfrastructureDependencies } from "@/core/container.js";

function registerMessagingDeps(): void {
  const container = getContainer();
  try {
    container.get("MessagingService");
  } catch {
    container.register(
      "MessagingService",
      (infra: InfrastructureDependencies) => new MessagingService(infra.db),
    );
    container.register(
      "MessagingController",
      () => new MessagingController(container.get("MessagingService")),
    );
  }
}

export function createMessagingRoutes(): Router {
  registerMessagingDeps();
  const container = getContainer();
  const ctrl = container.get<MessagingController>("MessagingController");
  const router = Router();

  router.post("/journey/:journeyId", authMiddleware, ctrl.sendMessage);
  router.get("/journey/:journeyId", authMiddleware, ctrl.getThread);
  router.put("/journey/:journeyId/read", authMiddleware, ctrl.markAsRead);
  router.get("/journey/:journeyId/unread-count", authMiddleware, ctrl.getUnreadCount);

  return router;
}
