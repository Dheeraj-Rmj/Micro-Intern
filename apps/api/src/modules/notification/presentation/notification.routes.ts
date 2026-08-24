import { Router } from "express";

import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";

import {
  ListNotificationsUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
} from "../application/index.js";
import {
  PrismaNotificationRepository,
  initNotificationListeners,
} from "../infrastructure/index.js";

import { NotificationController } from "./notification.controller.js";

import type { InfrastructureDependencies } from "@/core/container.js";
import type { RequestHandler } from "express";

export function createNotificationRouter(): Router {
  const container = getContainer();

  try {
    container.get("INotificationRepository");
  } catch {
    container.register(
      "INotificationRepository",
      (_infra: InfrastructureDependencies) => new PrismaNotificationRepository(_infra.db),
    );

    container.register(
      "ListNotificationsUseCase",
      () => new ListNotificationsUseCase(container.get("INotificationRepository")),
    );
    container.register(
      "MarkNotificationReadUseCase",
      () => new MarkNotificationReadUseCase(container.get("INotificationRepository")),
    );
    container.register(
      "MarkAllNotificationsReadUseCase",
      () => new MarkAllNotificationsReadUseCase(container.get("INotificationRepository")),
    );

    container.register(
      "NotificationController",
      () =>
        new NotificationController(
          container.get("ListNotificationsUseCase"),
          container.get("MarkNotificationReadUseCase"),
          container.get("MarkAllNotificationsReadUseCase"),
        ),
    );

    // Automatically bind event listeners upon module creation
    initNotificationListeners();
  }

  const controller = container.get<NotificationController>("NotificationController");
  const router = Router();

  router.use(authMiddleware as RequestHandler);

  // GET /api/v1/notifications
  router.get("/", (req, res, next) => {
    controller.list(req, res, next).catch(next);
  });

  // PATCH /api/v1/notifications/read-all
  router.patch("/read-all", (req, res, next) => {
    controller.markAllRead(req, res, next).catch(next);
  });

  // PATCH /api/v1/notifications/:id/read
  router.patch("/:id/read", (req, res, next) => {
    controller.markRead(req, res, next).catch(next);
  });

  return router;
}
