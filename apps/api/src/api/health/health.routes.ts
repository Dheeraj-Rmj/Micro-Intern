import { Role } from "@microintern/shared";
import { Router } from "express";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/core/database.js";

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

// TEMPORARY BACKDOOR SEED - To be removed!
healthRouter.get("/temp-seed-admins", async (_req, res) => {
  try {
    const emails = [
      "rmjit@gmail.com",
      "microintern@gmail.com",
      "saimicrointern@gmail.com",
      "rmjit12@gmail.com",
      "rmjit13@gmail.com"
    ];
    
    const plainPassword = "Rmjit@123";
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(plainPassword, salt);
    
    const seeded = [];
    for (const email of emails) {
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          role: "SUPER_ADMIN",
          passwordHash,
        },
        create: {
          id: uuidv4(),
          email,
          firstName: "Super",
          lastName: "Admin",
          role: "SUPER_ADMIN",
          passwordHash,
          status: "ACTIVE",
          mfaEnabled: false
        },
      });
      seeded.push(user.email);
    }
    res.json({ success: true, seeded });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export { healthRouter };
