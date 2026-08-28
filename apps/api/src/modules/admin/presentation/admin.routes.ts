import { Role, AuditAction } from "@microintern/shared";
import { Router } from "express";

import { getContainer } from "@/core/container.js";
import { audit } from "@/middleware/audit.middleware.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { requireRole } from "@/middleware/rbac.middleware.js";
import { createAuthRouter } from "@/modules/auth/presentation/auth.routes.js";

import {
  GetPlatformStatsUseCase,
  ListPendingCompaniesUseCase,
  VerifyCompanyUseCase,
  SuspendUserUseCase,
  ListUsersUseCase,
  ListTrialsUseCase,
  ListAuditLogsUseCase,
  GetEscrowMetricsUseCase,
  GetSubscriptionMetricsUseCase,
  GetPaymentMetricsUseCase,
  GetGlobalAnalyticsUseCase,
  CreateCompanyManuallyUseCase,
} from "../application/index.js";
import { PrismaAdminRepository } from "../infrastructure/index.js";

import { AdminController } from "./admin.controller.js";

import type { InfrastructureDependencies } from "@/core/container.js";
import type { RequestHandler } from "express";

export function createAdminRouter(): Router {
  const container = getContainer();

  // Ensure Auth dependencies (such as ISessionService) are registered
  try {
    container.get("ISessionService");
  } catch {
    createAuthRouter();
  }

  try {
    container.get("IAdminRepository");
  } catch {
    container.register(
      "IAdminRepository",
      (_infra: InfrastructureDependencies) => new PrismaAdminRepository(_infra.db),
    );

    container.register(
      "GetPlatformStatsUseCase",
      () => new GetPlatformStatsUseCase(container.get("IAdminRepository")),
    );
    container.register(
      "ListPendingCompaniesUseCase",
      () => new ListPendingCompaniesUseCase(container.get("IAdminRepository")),
    );
    container.register(
      "VerifyCompanyUseCase",
      () => new VerifyCompanyUseCase(container.get("IAdminRepository")),
    );
    container.register(
      "SuspendUserUseCase",
      () =>
        new SuspendUserUseCase(container.get("IAdminRepository"), container.get("ISessionService")),
    );
    container.register(
      "ListUsersUseCase",
      () => new ListUsersUseCase(container.get("IAdminRepository")),
    );
    container.register(
      "ListTrialsUseCase",
      () => new ListTrialsUseCase(container.get("IAdminRepository")),
    );
    container.register(
      "ListAuditLogsUseCase",
      () => new ListAuditLogsUseCase(container.get("IAdminRepository")),
    );

    container.register(
      "GetEscrowMetricsUseCase",
      () => new GetEscrowMetricsUseCase(container.get("IAdminRepository")),
    );
    container.register(
      "GetSubscriptionMetricsUseCase",
      () => new GetSubscriptionMetricsUseCase(container.get("IAdminRepository")),
    );
    container.register(
      "GetPaymentMetricsUseCase",
      () => new GetPaymentMetricsUseCase(container.get("IAdminRepository")),
    );
    container.register(
      "GetGlobalAnalyticsUseCase",
      () => new GetGlobalAnalyticsUseCase(container.get("IAdminRepository")),
    );

    container.register(
      "CreateCompanyManuallyUseCase",
      () => new CreateCompanyManuallyUseCase(container.get("IAdminRepository") as PrismaAdminRepository),
    );

    container.register(
      "AdminController",
      () =>
        new AdminController(
          container.get("GetPlatformStatsUseCase"),
          container.get("ListPendingCompaniesUseCase"),
          container.get("VerifyCompanyUseCase"),
          container.get("SuspendUserUseCase"),
          container.get("ListUsersUseCase"),
          container.get("ListTrialsUseCase"),
          container.get("ListAuditLogsUseCase"),
          container.get("GetEscrowMetricsUseCase"),
          container.get("GetSubscriptionMetricsUseCase"),
          container.get("GetPaymentMetricsUseCase"),
          container.get("GetGlobalAnalyticsUseCase"),
          container.get("CreateCompanyManuallyUseCase"),
        ),
    );
  }

  const controller = container.get<AdminController>("AdminController");
  const router = Router();

  // All endpoints in Admin router strictly require ADMIN role or higher (SUPER_ADMIN)
  router.use(authMiddleware as RequestHandler, requireRole(Role.ADMIN) as RequestHandler);

  // GET /api/v1/admin/stats
  router.get("/stats", (req, res, next) => {
    controller.getStats(req, res, next).catch(next);
  });

  // GET /api/v1/admin/companies/pending
  router.get("/companies/pending", (req, res, next) => {
    controller.listPendingCompanies(req, res, next).catch(next);
  });

  // POST /api/v1/admin/companies/manual
  router.post(
    "/companies/manual" as unknown as string,
    requireRole(Role.SUPER_ADMIN) as RequestHandler,
    audit(AuditAction.CREATE, "Company") as RequestHandler,
    (req, res, next) => {
      controller.createCompanyManually(req, res, next).catch(next);
    },
  );

  // POST /api/v1/admin/companies/:id/verify
  router.post(
    "/companies/:id/verify" as unknown as string,
    audit(AuditAction.UPDATE, "Company") as RequestHandler,
    (req, res, next) => {
      controller.verifyCompany(req, res, next).catch(next);
    },
  );

  // POST /api/v1/admin/users/:id/suspend
  router.post(
    "/users/:id/suspend" as unknown as string,
    audit(AuditAction.UPDATE, "User") as RequestHandler,
    (req, res, next) => {
      controller.suspendUser(req, res, next).catch(next);
    },
  );

  // GET /api/v1/admin/users
  router.get("/users", (req, res, next) => {
    controller.listUsers(req, res, next).catch(next);
  });

  // GET /api/v1/admin/trials
  router.get("/trials", (req, res, next) => {
    controller.listTrials(req, res, next).catch(next);
  });

  // GET /api/v1/admin/audit-logs
  router.get("/audit-logs", (req, res, next) => {
    controller.listAuditLogs(req, res, next).catch(next);
  });

  // POST /api/v1/admin/broadcast
  router.post(
    "/broadcast",
    audit(AuditAction.CREATE, "Broadcast") as RequestHandler,
    (req, res, next) => {
      controller.broadcastAlert(req, res, next).catch(next);
    },
  );

  // POST /api/v1/admin/impersonate
  router.post(
    "/impersonate",
    audit(AuditAction.UPDATE, "SessionImpersonation") as RequestHandler,
    (req, res, next) => {
      controller.impersonateUser(req, res, next).catch(next);
    },
  );

  // GET /api/v1/admin/settings
  router.get("/settings", (req, res, next) => {
    controller.getSettings(req, res, next).catch(next);
  });

  // POST /api/v1/admin/settings
  router.post(
    "/settings",
    audit(AuditAction.UPDATE, "SystemSettings") as RequestHandler,
    (req, res, next) => {
      controller.updateSettings(req, res, next).catch(next);
    },
  );

  // GET /api/v1/admin/metrics/escrow
  router.get("/metrics/escrow", (req, res, next) => {
    controller.getEscrowMetrics(req, res, next).catch(next);
  });

  // GET /api/v1/admin/metrics/subscriptions
  router.get("/metrics/subscriptions", (req, res, next) => {
    controller.getSubscriptionMetrics(req, res, next).catch(next);
  });

  // GET /api/v1/admin/metrics/payments
  router.get("/metrics/payments", (req, res, next) => {
    controller.getPaymentMetrics(req, res, next).catch(next);
  });

  // GET /api/v1/admin/metrics/ai-analytics
  router.get("/metrics/ai-analytics", (req, res, next) => {
    controller.getGlobalAnalytics(req, res, next).catch(next);
  });

  return router;
}
