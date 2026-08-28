import { Router } from "express";

import { createAdminRouter } from "@/modules/admin/presentation/admin.routes.js";
import { createAuthRouter } from "@/modules/auth/presentation/auth.routes.js";
import { createCandidateRouter } from "@/modules/candidate/presentation/candidate.routes.js";
import { createCompanyRouter } from "@/modules/company/presentation/company.routes.js";
import { createEvaluationRouter } from "@/modules/evaluation/presentation/evaluation.routes.js";
import {
  createSubmissionRouter,
  attachAssessmentSubmissionRoutes,
} from "@/modules/submission/presentation/submission.routes.js";
import { createManagementRouter } from "@/modules/management/presentation/management.routes.js";
import { createNotificationRouter } from "@/modules/notification/presentation/notification.routes.js";
import { createAssessmentRouter } from "@/modules/assessment/presentation/assessment.routes.js";
import { healthRouter } from "@/api/health/health.routes.js";

// Skill-Based Hiring Platform Modules
import { createSkillRoutes } from "@/modules/skill-framework/presentation/skill.routes.js";
import { createRoleProfileRoutes } from "@/modules/skill-framework/presentation/role-profile.routes.js";
import { createEvidenceRoutes } from "@/modules/evidence/presentation/evidence.routes.js";
import { createSkillVerificationRoutes } from "@/modules/skill-verification/presentation/skill-verification.routes.js";
import { createPortfolioRoutes } from "@/modules/portfolio/presentation/portfolio.routes.js";
import { createPublicProfileRoutes } from "@/modules/portfolio/presentation/public-profile.routes.js";
import { createMatchingRoutes } from "@/modules/matching/presentation/matching.routes.js";
import { createLearningRoutes } from "@/modules/learning/presentation/learning.routes.js";
import { createCandidateJourneyRoutes } from "@/modules/candidate-journey/presentation/candidate-journey.routes.js";
import { createSearchRoutes } from "@/modules/search/presentation/search.routes.js";
import { createDocsRoutes } from "@/api/docs/openapi.js";
import { createEkycRouter } from "@/modules/ekyc/presentation/ekyc.routes.js";
import { usersRoutes } from "@/modules/users/presentation/users.routes.js";
// ── Phase 10: High & Medium Value Features ────────────────────────────────────
import { createInterviewRoutes } from "@/modules/interview/presentation/interview.routes.js";
import { createWebhookRoutes } from "@/modules/webhook/presentation/webhook.routes.js";
import { createMessagingRoutes } from "@/modules/messaging/presentation/messaging.routes.js";
import { createQuestionBankRoutes } from "@/modules/question-bank/presentation/question-bank.routes.js";
import { createLeaderboardRoutes } from "@/modules/leaderboard/presentation/leaderboard.routes.js";
import { createReferralRoutes } from "@/modules/referral/presentation/referral.routes.js";
import { createDiversityRoutes } from "@/modules/diversity/presentation/diversity.routes.js";
import { createSlackRoutes } from "@/modules/integrations/slack/presentation/slack.routes.js";
import { createAIToolsRouter } from "@/modules/management/presentation/ai-tools.routes.js";
import { createNetworkRouter } from "@/modules/network/presentation/network.routes.js";

export function createV1Router(): Router {
  const v1Router = Router();
  const authRouter = createAuthRouter();
  const companyRouter = createCompanyRouter();
  const assessmentRouter = createAssessmentRouter();
  attachAssessmentSubmissionRoutes(assessmentRouter);

  // ── Core Platform ──────────────────────────────────────────────────────────
  v1Router.use("/health", healthRouter);
  v1Router.use("/auth", authRouter);
  v1Router.use("/management", createManagementRouter());
  v1Router.use("/candidates", createCandidateRouter());
  v1Router.use("/companies", companyRouter);
  v1Router.use("/assessments", assessmentRouter);
  v1Router.use("/submissions", createSubmissionRouter());
  v1Router.use("/submissions", createEvaluationRouter());
  v1Router.use("/admin", createAdminRouter());
  v1Router.use("/notifications", createNotificationRouter());
  v1Router.use("/ekyc", createEkycRouter());
  v1Router.use("/users", usersRoutes);
  v1Router.use("/network", createNetworkRouter());
  // ── Skill-Based Hiring Platform ────────────────────────────────────────────
  v1Router.use("/skills", createSkillRoutes());
  v1Router.use("/role-profiles", createRoleProfileRoutes());
  v1Router.use("/evidence", createEvidenceRoutes());
  v1Router.use("/verifications", createSkillVerificationRoutes());
  v1Router.use("/portfolios", createPortfolioRoutes());
  v1Router.use("/public-profiles", createPublicProfileRoutes());
  v1Router.use("/matching", createMatchingRoutes());
  v1Router.use("/learning-recommendations", createLearningRoutes());
  v1Router.use("/candidate-journeys", createCandidateJourneyRoutes());
  v1Router.use("/search", createSearchRoutes());

  // ── Phase 10: High & Medium Value Features ─────────────────────────────────
  v1Router.use("/interviews", createInterviewRoutes());
  v1Router.use("/webhooks", createWebhookRoutes());
  v1Router.use("/messages", createMessagingRoutes());
  v1Router.use("/question-bank", createQuestionBankRoutes());
  v1Router.use("/leaderboard", createLeaderboardRoutes());
  v1Router.use("/referrals", createReferralRoutes());
  v1Router.use("/diversity", createDiversityRoutes());
  v1Router.use("/integrations/slack", createSlackRoutes());
  v1Router.use("/ai-tools", createAIToolsRouter());

  // ── Docs ────────────────────────────────────────────────────────────────────
  v1Router.use("/", createDocsRoutes());

  return v1Router;
}
