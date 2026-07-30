import { hasRoleOrHigher } from "@microintern/shared";

import { ForbiddenError, UnauthorizedError } from "@/shared/errors/index.js";

import type { Role } from "@microintern/shared";
import type { Request, Response, NextFunction } from "express";

/**
 * RBAC — Role-Based Access Control middleware.
 *
 * Design: Permission checks happen at the route level, not inside business logic.
 * This keeps use cases free of authorization concerns (single responsibility).
 *
 * Permission model:
 * - requireRole: user must have exactly this role or higher in hierarchy
 * - requireAnyRole: user must have one of the listed roles
 * - requireSameCompany: user must belong to the specified company
 * - requireSelf: user can only access their own resources
 *
 * Company scoping: Company-scoped operations use requireCompanyMember to ensure
 * recruiters and company owners can only act within their own company.
 */

/**
 * Require a minimum role level.
 * SUPER_ADMIN always passes.
 *
 * @example
 * router.post('/companies', authMiddleware, requireRole('ADMIN'), controller.create);
 */
export function requireRole(minimumRole: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    if (!hasRoleOrHigher(req.user.role as Role, minimumRole)) {
      next(
        new ForbiddenError(
          `This action requires ${minimumRole} role or higher`,
          "AUTH_INSUFFICIENT_PERMISSIONS",
        ),
      );
      return;
    }

    next();
  };
}

/**
 * Require that the user has one of the allowed roles.
 *
 * @example
 * router.get('/assessments', authMiddleware, requireAnyRole(['RECRUITER', 'COMPANY_OWNER']), ...);
 */
export function requireAnyRole(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    const userRole = req.user.role as Role;

    // SUPER_ADMIN always passes
    if (userRole === "SUPER_ADMIN") {
      next();
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      next(
        new ForbiddenError(
          `This action is restricted to: ${allowedRoles.join(", ")}`,
          "AUTH_ROLE_MISMATCH",
        ),
      );
      return;
    }

    next();
  };
}

/**
 * Require that the authenticated user belongs to the company specified
 * in route parameters (`:companyId`).
 *
 * SUPER_ADMIN and ADMIN bypass this check.
 */
export function requireCompanyMember() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    const userRole = req.user.role as Role;

    // Platform staff bypass company scoping
    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
      next();
      return;
    }

    const companyId = req.params["companyId"];
    if (companyId === undefined) {
      next(new ForbiddenError("Company context required"));
      return;
    }

    if (req.user.companyId !== companyId) {
      next(
        new ForbiddenError(
          "You do not have access to this company",
          "AUTH_INSUFFICIENT_PERMISSIONS",
        ),
      );
      return;
    }

    next();
  };
}

/**
 * Require that the authenticated user is accessing their own resource.
 * Checks req.params.userId against req.user.id.
 *
 * SUPER_ADMIN and ADMIN bypass this check.
 */
export function requireSelf() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    const userRole = req.user.role as Role;

    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
      next();
      return;
    }

    const resourceUserId = req.params["userId"];
    if (req.user.id !== resourceUserId) {
      next(
        new ForbiddenError(
          "You can only access your own resources",
          "AUTH_INSUFFICIENT_PERMISSIONS",
        ),
      );
      return;
    }

    next();
  };
}
