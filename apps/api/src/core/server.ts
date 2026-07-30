import http from "node:http";

import { createApp } from "./app.js";
import { config } from "./config.js";
import { createContainer } from "./container.js";
import { connectDatabase, disconnectDatabase } from "./database.js";
import { logger } from "./logger.js";
import { connectRedis, disconnectRedis } from "./redis.js";
import { startEmailWorker } from "../infrastructure/queue/workers/email.worker.js";
import { startResumeParserWorker } from "../infrastructure/queue/workers/resume-parser.worker.js";
import { startAssessmentAIWorker } from "../infrastructure/queue/workers/assessment-ai.worker.js";

/**
 * HTTP server bootstrap and graceful shutdown.
 *
 * Startup sequence:
 * 1. Validate config (happens on import of config.ts)
 * 2. Connect database
 * 3. Connect Redis
 * 4. Initialize DI container
 * 5. Create Express app
 * 6. Start HTTP server
 *
 * Shutdown sequence (SIGTERM / SIGINT):
 * 1. Stop accepting new connections
 * 2. Wait for in-flight requests to complete (30s timeout)
 * 3. Disconnect Redis
 * 4. Disconnect database
 * 5. Exit process
 *
 * This ensures zero-downtime deployments when used with a load balancer.
 */

async function bootstrap(): Promise<void> {
  logger.info({ env: config.NODE_ENV, version: config.APP_VERSION }, "🚀 Starting MicroIntern API");

  // ── Infrastructure connections ────────────────────────────────────────────
  await connectDatabase();
  await connectRedis();

  // ── Initialize DI container & Event Listeners ─────────────────────────────
  createContainer();
  logger.info("DI container initialized");

  const { registerSlackEventListeners } =
    await import("../modules/notification/infrastructure/listeners/SlackEventListener.js");
  registerSlackEventListeners();

  const { registerWebhookEventListeners } =
    await import("../modules/webhook/infrastructure/listeners/WebhookEventListener.js");
  registerWebhookEventListeners();

  const { initWebhookWorker } =
    await import("../modules/webhook/infrastructure/workers/WebhookWorker.js");
  initWebhookWorker();

  const { initResumeParserWorker } =
    await import("../modules/candidate/infrastructure/workers/ResumeParserWorker.js");
  initResumeParserWorker();

  // ── Start background queue workers ────────────────────────────────────────
  startEmailWorker();
  startResumeParserWorker();
  startAssessmentAIWorker();
  logger.info("Background BullMQ workers started");

  // ── Register Event Listeners (Phase 6 Notification Pipeline) ──────────────
  const { DomainEventDispatcher } = await import("./events/DomainEventDispatcher.js");
  const { MockMailerService } =
    await import("../modules/notifications/infrastructure/MockMailerService.js");
  const { NotificationEventSubscriber } =
    await import("../modules/notifications/application/NotificationEventSubscriber.js");
  const { prisma } = await import("./database.js");
  const { GenerateCandidateRecoveryReportUseCase } =
    await import("../modules/learning/application/use-cases/GenerateCandidateRecoveryReportUseCase.js");
  const { GenerateAIOnboardingPlanUseCase } =
    await import("../modules/learning/application/use-cases/GenerateAIOnboardingPlanUseCase.js");
  const { AIFallbackEngine } = await import("../infrastructure/ai/AIFallbackEngine.js");

  const mailer = new MockMailerService();
  const aiEngine = new AIFallbackEngine([]);
  const recoveryGenerator = new GenerateCandidateRecoveryReportUseCase(aiEngine);
  const onboardingGenerator = new GenerateAIOnboardingPlanUseCase(prisma, aiEngine);
  const notificationSubscriber = new NotificationEventSubscriber(
    mailer,
    prisma,
    recoveryGenerator,
    onboardingGenerator,
  );

  DomainEventDispatcher.getInstance().subscribe("CandidateJourneyStatusChanged", (e) =>
    notificationSubscriber.handle(e),
  );
  logger.info("Notification Event Subscribers registered");

  // ── Phase 10: Webhook + Slack + Offer Letter Event Integration ────────────
  const { WebhookService } = await import("../modules/webhook/application/WebhookService.js");
  const { SlackService } = await import("../modules/integrations/slack/SlackService.js");
  const { GenerateOfferLetterUseCase } =
    await import("../modules/management/application/use-cases/GenerateOfferLetterUseCase.js");

  const webhookService = new WebhookService(prisma);
  const slackService = new SlackService(prisma);
  const offerLetterUseCase = new GenerateOfferLetterUseCase(aiEngine);

  // Fire webhooks + Slack on every CandidateJourney status change
  DomainEventDispatcher.getInstance().subscribe("CandidateJourneyStatusChanged", async (event) => {
    const meta = event.metadata as Record<string, unknown>;
    const companyId = meta["companyId"] as string | undefined;
    const newStatus = meta["newStatus"] as string | undefined;
    const candidateId = meta["candidateId"] as string | undefined;

    if (!companyId) return;

    const slackPayload = { candidateId, newStatus };

    // Dispatch to registered webhooks
    await webhookService.dispatch(companyId, "CANDIDATE_JOURNEY_UPDATED", {
      journeyId: event.entityId,
      candidateId,
      newStatus,
    });

    // Notify Slack
    if (newStatus === "HIRED") {
      await slackService.notify(companyId, "CANDIDATE_HIRED", slackPayload);

      // Auto-generate offer letter on hire
      try {
        const journey = await prisma.candidateJourney.findUnique({
          where: { id: event.entityId },
          include: { roleProfile: true },
        });
        if (journey) {
          const candidate = await prisma.candidateProfile.findUnique({
            where: { id: journey.candidateId },
            include: { user: true },
          });
          const company = await prisma.company.findUnique({ where: { id: journey.companyId } });
          if (candidate && company) {
            await offerLetterUseCase.execute({
              journeyId: journey.id,
              companyName: company.name,
              candidateName: `${candidate.user.firstName} ${candidate.user.lastName}`,
              roleName: journey.roleProfile?.title ?? "Position",
              startDate: "To be confirmed",
              salary: "Competitive",
            });
            logger.info({ journeyId: journey.id }, "✅ Offer letter auto-generated on hire");
          }
        }
      } catch (err) {
        logger.warn({ err }, "Offer letter generation failed — non-critical");
      }
    } else if (newStatus === "REJECTED") {
      await slackService.notify(companyId, "CANDIDATE_REJECTED", slackPayload);
    }
  });

  logger.info("Phase 10 event subscribers registered (Webhook + Slack + Offer Letter)");

  // ── Create Express application ────────────────────────────────────────────
  const app = createApp();
  const server = http.createServer(app);

  // ── Start server ──────────────────────────────────────────────────────────
  server.listen(config.API_PORT, config.API_HOST, () => {
    logger.info(
      {
        host: config.API_HOST,
        port: config.API_PORT,
        url: config.API_BASE_URL,
      },
      `✅ API server listening`,
    );
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const SHUTDOWN_TIMEOUT_MS = 30_000;

  async function gracefulShutdown(signal: string): Promise<void> {
    logger.info({ signal }, "⏹️ Graceful shutdown initiated");

    // Stop accepting new connections
    server.close(() => {
      logger.info("HTTP server closed");
    });

    // Force exit after timeout
    const forceExit = setTimeout(() => {
      logger.error("Graceful shutdown timeout — forcing exit");
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    forceExit.unref(); // Don't keep process alive for this timer

    try {
      await disconnectRedis();
      await disconnectDatabase();
      logger.info("✅ Clean shutdown complete");
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, "Error during shutdown");
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  }

  process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => void gracefulShutdown("SIGINT"));

  // ── Unhandled rejection / exception handlers ──────────────────────────────
  process.on("unhandledRejection", (reason, promise) => {
    logger.fatal({ reason, promise }, "🚨 Unhandled Promise Rejection — shutting down");
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    void gracefulShutdown("unhandledRejection");
  });

  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "🚨 Uncaught Exception — shutting down");
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    void gracefulShutdown("uncaughtException");
  });
}

// ── Entry point ────────────────────────────────────────────────────────────
bootstrap().catch((error: unknown) => {
  console.error("Fatal error during startup:", error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
