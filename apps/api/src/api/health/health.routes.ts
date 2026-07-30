import { Role } from "@microintern/shared";
import { Router } from "express";

import { authMiddleware } from "@/middleware/auth.middleware.js";
import { requireRole } from "@/middleware/rbac.middleware.js";

import { healthController } from "./health.controller.js";

const healthRouter: Router = Router();

// Liveness — no auth, fastest possible response
healthRouter.get("/", (_req, res) => {
  void healthController.liveness(_req, res);
});

// Readiness — no auth, used by load balancers
// eslint-disable-next-line @typescript-eslint/no-floating-promises
healthRouter.get("/ready", (_req, res) => {
  void healthController.readiness(_req, res);
});

// Detailed — auth-protected, for monitoring dashboards only
healthRouter.get(
  "/detailed",
  authMiddleware,
  requireRole(Role.ADMIN),
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (_req, res) => {
    void healthController.detailed(_req, res);
  },
);

// K8s & Prometheus observability aliases
healthRouter.get("/liveness", (_req, res) => {
  void healthController.liveness(_req, res);
});
// eslint-disable-next-line @typescript-eslint/no-floating-promises
healthRouter.get("/readiness", (_req, res) => {
  void healthController.readiness(_req, res);
});
healthRouter.get("/metrics", (_req, res) => {
  void healthController.metrics(_req, res);
});

export { healthRouter };
