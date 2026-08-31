import { AuditAction, Role } from "@microintern/shared";
import { Router } from "express";

import { getContainer, type InfrastructureDependencies } from "@/core/container.js";
import { audit } from "@/middleware/audit.middleware.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { authRateLimiter } from "@/middleware/ratelimit.middleware.js";
import { requireRole, requireAnyRole } from "@/middleware/rbac.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import { LoginSchema } from "@/modules/auth/application/dtos/auth.dto.js";
import {
  InviteRecruiterUseCase,
  InviteAdminUseCase,
  AcceptInvitationUseCase,
} from "@/modules/auth/application/use-cases/invitation.usecase.js";
import { ManagementLoginUseCase } from "@/modules/auth/application/use-cases/management-auth.usecase.js";
import { ConfigureSkillTrailUseCase } from "../application/use-cases/ConfigureSkillTrailUseCase.js";
import { PrismaUserRepository } from "@/modules/auth/infrastructure/repositories/PrismaUserRepository.js";
import {
  BcryptPasswordService,
  RedisSessionService,
} from "@/modules/auth/infrastructure/services/AuthServices.js";
import { JwtService } from "@/modules/auth/infrastructure/services/JwtService.js";
import { QueueEmailAuthService } from "@/modules/auth/infrastructure/services/QueueEmailAuthService.js";
import { TokenService } from "@/modules/auth/infrastructure/services/TokenService.js";

import {
  ManagementController,
  AcceptInvitationSchema,
  InviteRecruiterSchema,
  InviteAdminSchema,
} from "./management.controller.js";

import type { RequestHandler } from "express";

/**
 * Management router factory.
 *
 * Exposes enterprise & admin login and invitation onboarding endpoints under /api/v1/management.
 */
export function createManagementRouter(): Router {
  const container = getContainer();

  // Register required dependencies if not already registered
  try {
    container.get("ManagementController");
  } catch {
    try {
      container.get("IUserRepository");
    } catch {
      container.register(
        "IUserRepository",
        (_infra: InfrastructureDependencies) => new PrismaUserRepository(_infra.db),
      );
      container.register("IJwtService", () => new JwtService());
      container.register("IPasswordService", () => new BcryptPasswordService());
      container.register(
        "ISessionService",
        (_infra: InfrastructureDependencies) => new RedisSessionService(),
      );
      container.register("TokenService", () => new TokenService());
      container.register("IEmailAuthService", () => new QueueEmailAuthService());
    }

    container.register(
      "ManagementLoginUseCase",
      () =>
        new ManagementLoginUseCase(
          container.get("IUserRepository"),
          container.get("IPasswordService"),
          container.get("IJwtService"),
          container.get("ISessionService"),
        ),
    );

    container.register(
      "InviteRecruiterUseCase",
      () =>
        new InviteRecruiterUseCase(
          container.get("IUserRepository"),
          container.get("IEmailAuthService"),
          container.get("TokenService"),
        ),
    );

    container.register(
      "InviteAdminUseCase",
      () =>
        new InviteAdminUseCase(
          container.get("IUserRepository"),
          container.get("IEmailAuthService"),
          container.get("TokenService"),
        ),
    );

    container.register(
      "AcceptInvitationUseCase",
      () =>
        new AcceptInvitationUseCase(
          container.get("IUserRepository"),
          container.get("IPasswordService"),
          container.get("IJwtService"),
          container.get("ISessionService"),
          container.get("TokenService"),
        ),
    );

    container.register(
      "ConfigureSkillTrailUseCase",
      (infra: InfrastructureDependencies) => new ConfigureSkillTrailUseCase(infra.db),
    );

    container.register(
      "ManagementController",
      () =>
        new ManagementController(
          container.get("ManagementLoginUseCase"),
          container.get("InviteRecruiterUseCase"),
          container.get("InviteAdminUseCase"),
          container.get("AcceptInvitationUseCase"),
          container.get("ConfigureSkillTrailUseCase"),
        ),
    );
  }

  const controller = container.get<ManagementController>("ManagementController");
  const router = Router();

  // POST /api/v1/management/auth/login
  router.post(
    "/auth/login",
    authRateLimiter,
    validate("body", LoginSchema),
    audit(AuditAction.LOGIN, "User"),
    (req, res, next) => {
      controller.login(req, res, next).catch(next);
    },
  );

  // POST /api/v1/management/invitations/accept
  router.post(
    "/invitations/accept",
    authRateLimiter,
    validate("body", AcceptInvitationSchema),
    audit(AuditAction.REGISTER, "User"),
    (req, res, next) => {
      controller.acceptInvitation(req, res, next).catch(next);
    },
  );

  // POST /api/v1/management/invitations/recruiter (Requires COMPANY_OWNER, ADMIN, or SUPER_ADMIN)
  router.post(
    "/invitations/recruiter",
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]) as RequestHandler,
    validate("body", InviteRecruiterSchema),
    audit(AuditAction.CREATE, "Invitation"),
    (req, res, next) => {
      controller.inviteRecruiter(req, res, next).catch(next);
    },
  );

  // POST /api/v1/management/invitations/admin (Requires SUPER_ADMIN)
  router.post(
    "/invitations/admin",
    authMiddleware as RequestHandler,
    requireRole(Role.SUPER_ADMIN) as RequestHandler,
    validate("body", InviteAdminSchema),
    audit(AuditAction.CREATE, "Invitation"),
    (req, res, next) => {
      controller.inviteAdmin(req, res, next).catch(next);
    },
  );

  // POST /api/v1/management/skill-trails/config
  router.post(
    "/skill-trails/config",
    authMiddleware as RequestHandler,
    requireAnyRole([Role.COMPANY_OWNER, Role.ADMIN]) as RequestHandler,
    audit(AuditAction.UPDATE, "SkillTrailConfig"),
    (req, res, next) => {
      controller.configureSkillTrail(req, res, next).catch(next);
    },
  );

  return router;
}
