import { Router } from "express";
import { usersController } from "./users.controller.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { requireAnyRole } from "../../../middleware/rbac.middleware.js";
import { createRateLimitMiddleware } from "../../../middleware/ratelimit.middleware.js";
import { Role } from "@microintern/shared";

const router = Router();

// Rate limiting for admin actions
const adminLimiter = createRateLimitMiddleware("global");

// Admin-only route: Generate secure onboarding link
router.post(
  "/admin/generate-onboarding-link",
  authMiddleware,
  requireAnyRole([Role.SUPER_ADMIN]),
  adminLimiter,
  usersController.generateUrl.bind(usersController),
);

export const usersRoutes: Router = router;
