import { Router } from "express";
import { getContainer } from "@/core/container.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { requireAnyRole } from "@/middleware/rbac.middleware.js";
import { Role } from "@microintern/shared";
import { PrismaCandidateJourneyRepository } from "../infrastructure/PrismaCandidateJourneyRepository.js";
import { CandidateJourneyService } from "../application/CandidateJourneyService.js";
import { CandidateJourneyAutomationListener } from "../application/CandidateJourneyAutomationListener.js";
import { ProcessSkillTrailProgressionUseCase } from "../application/use-cases/ProcessSkillTrailProgressionUseCase.js";
import { CandidateJourneyController } from "./candidate-journey.controller.js";
import type { InfrastructureDependencies } from "@/core/container.js";
import { EvidenceService } from "@/modules/evidence/application/EvidenceService.js";
import { SkillVerificationService } from "@/modules/skill-verification/application/SkillVerificationService.js";
import { PrismaEvidenceRepository } from "@/modules/evidence/infrastructure/PrismaEvidenceRepository.js";
import { PrismaSkillVerificationRepository } from "@/modules/skill-verification/infrastructure/PrismaSkillVerificationRepository.js";

export function registerCandidateJourneyModuleDependencies(): void {
  const container = getContainer();

  try {
    container.get("ICandidateJourneyRepository");
  } catch {
    container.register("ICandidateJourneyRepository", (infra: InfrastructureDependencies) => {
      return new PrismaCandidateJourneyRepository(infra.db);
    });

    container.register("CandidateJourneyService", () => {
      return new CandidateJourneyService(container.get("ICandidateJourneyRepository"));
    });

    container.register("CandidateJourneyController", () => {
      return new CandidateJourneyController(container.get("CandidateJourneyService"));
    });

    // Register and start event automation listener
    container.register(
      "CandidateJourneyAutomationListener",
      (infra: InfrastructureDependencies) => {
        const journeyRepo = new PrismaCandidateJourneyRepository(infra.db);
        const journeyService = new CandidateJourneyService(journeyRepo);
        const evidenceService = new EvidenceService(new PrismaEvidenceRepository(infra.db));
        const verificationService = new SkillVerificationService(
          new PrismaSkillVerificationRepository(infra.db),
        );
        const processSkillTrailProgressionUseCase = new ProcessSkillTrailProgressionUseCase(
          infra.db,
          journeyService,
        );
        const listener = new CandidateJourneyAutomationListener(
          journeyRepo,
          journeyService,
          evidenceService,
          verificationService,
          processSkillTrailProgressionUseCase,
        );
        listener.registerListeners();
        return listener;
      },
    );

    // Trigger immediate registration of listeners
    container.get("CandidateJourneyAutomationListener");
  }
}

export function createCandidateJourneyRoutes(): Router {
  registerCandidateJourneyModuleDependencies();
  const container = getContainer();
  const controller = container.get<CandidateJourneyController>("CandidateJourneyController");

  const router = Router();

  router.post(
    "/",
    authMiddleware,
    requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN, Role.COMPANY_OWNER, Role.RECRUITER]),
    controller.startJourney,
  );
  router.put(
    "/:id/advance",
    authMiddleware,
    requireAnyRole([Role.ADMIN, Role.SUPER_ADMIN, Role.COMPANY_OWNER, Role.RECRUITER]),
    controller.advanceJourney,
  );
  // /candidate/me — MUST be before /:id to avoid route conflict
  router.get("/candidate/me", authMiddleware, controller.listCandidateJourneys);
  router.get("/:id", authMiddleware, controller.getJourney);
  router.get("/candidate/:candidateId", authMiddleware, controller.listCandidateJourneys);
  router.get("/company/:companyId", authMiddleware, controller.listCompanyJourneys);

  return router;
}
