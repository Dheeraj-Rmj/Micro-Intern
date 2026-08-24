import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { requireAnyRole } from "@/middleware/rbac.middleware.js";
import { Role } from "@microintern/shared";
import { InterviewService } from "../application/InterviewService.js";
import { InterviewController } from "./interview.controller.js";
import type { InfrastructureDependencies } from "@/core/container.js";

function registerInterviewDeps(): void {
  const container = getContainer();
  try {
    container.get("InterviewService");
  } catch {
    container.register(
      "InterviewService",
      (infra: InfrastructureDependencies) => new InterviewService(infra.db, infra.aiEngine),
    );
    container.register(
      "InterviewController",
      () => new InterviewController(container.get("InterviewService")),
    );
  }
}

export function createInterviewRoutes(): Router {
  registerInterviewDeps();
  const container = getContainer();
  const ctrl = container.get<InterviewController>("InterviewController");
  const router = Router();

  // Recruiter: manage interviews
  router.post(
    "/",
    authMiddleware,
    requireAnyRole([Role.RECRUITER, Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]),
    ctrl.createInterview,
  );
  router.put(
    "/:id/publish",
    authMiddleware,
    requireAnyRole([Role.RECRUITER, Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]),
    ctrl.publishInterview,
  );
  router.get("/:id", authMiddleware, ctrl.getInterview);
  router.get("/", authMiddleware, ctrl.listCompanyInterviews);
  router.post(
    "/:id/invite",
    authMiddleware,
    requireAnyRole([Role.RECRUITER, Role.COMPANY_OWNER, Role.ADMIN, Role.SUPER_ADMIN]),
    ctrl.inviteCandidate,
  );

  // Candidate: sessions
  router.get("/sessions/mine", authMiddleware, ctrl.getMySessions);
  router.put("/sessions/:sessionId/start", authMiddleware, ctrl.startSession);
  router.post("/sessions/:sessionId/answers", authMiddleware, ctrl.submitAnswer);
  router.put("/sessions/:sessionId/submit", authMiddleware, ctrl.submitSession);
  router.get("/sessions/:sessionId", authMiddleware, ctrl.getSession);
  router.get("/sessions/:sessionId/report", authMiddleware, ctrl.getSessionReport);

  return router;
}
