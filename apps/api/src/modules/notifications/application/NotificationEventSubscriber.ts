import { createModuleLogger } from "@/core/logger.js";
import type { IDomainEvent } from "@/core/events/DomainEventDispatcher.js";
import type { IMailerService } from "../infrastructure/MockMailerService.js";
import { PrismaClient, CandidateJourneyStatus } from "@microintern/database";
import { GenerateCandidateRecoveryReportUseCase } from "../../learning/application/use-cases/GenerateCandidateRecoveryReportUseCase.js";
import { GenerateAIOnboardingPlanUseCase } from "../../learning/application/use-cases/GenerateAIOnboardingPlanUseCase.js";
import { NotificationService } from "./NotificationService.js";
import { NotificationChannel } from "@microintern/database";

const log = createModuleLogger("NotificationEventSubscriber");

export class NotificationEventSubscriber {
  constructor(
    private readonly mailer: IMailerService,
    private readonly prisma: PrismaClient,
    private readonly recoveryReportGenerator: GenerateCandidateRecoveryReportUseCase,
    private readonly onboardingPlanGenerator: GenerateAIOnboardingPlanUseCase,
    private readonly notificationService: NotificationService,
  ) {}

  public async handle(event: IDomainEvent): Promise<void> {
    if (event.eventName === "CandidateJourneyStatusChanged") {
      await this.handleJourneyStatusChanged(event);
    }
  }

  private async handleJourneyStatusChanged(event: IDomainEvent): Promise<void> {
    const { journeyId, newStatus } = event.metadata || {};

    if (!journeyId || !newStatus) return;

    log.info({ journeyId, newStatus }, "Notification Engine processing journey status change");

    try {
      const journey: any = await this.prisma.candidateJourney.findUnique({
        where: { id: journeyId },
        include: {
          roleProfile: true,
        },
      });

      if (!journey || !journey.roleProfile) return;

      const candidate = await this.prisma.candidateProfile.findUnique({
        where: { id: journey.candidateId },
      });

      const company = await this.prisma.company.findUnique({
        where: { id: journey.companyId },
      });

      if (!candidate || !company) return;

      const recruiters = await this.prisma.companyMember.findMany({
        where: { companyId: company.id, role: "RECRUITER" },
      });

      const candidateEmail = candidate.userId + "@mockcandidate.com"; // Using userId as mock email
      const recruiterEmail =
        "hiring-manager@" + company.name.toLowerCase().replace(/\s/g, "") + ".com";

      if (newStatus === CandidateJourneyStatus.REJECTED) {
        // TRIGGER PHASE 4 CANDIDATE RECOVERY
        log.info("Candidate rejected. Triggering AI Recovery Report generation...");

        // In a real system, we'd fetch actual evaluation JSON. Mocking it for the notification engine test.
        const mockEvalJSON = JSON.stringify({
          overallScore: 45,
          skills: [{ name: "React", score: 40 }],
          notes: "Struggled with state management.",
        });

        const report = await this.recoveryReportGenerator.execute({
          candidateId: journey.candidateId,
          roleProfile: journey.roleProfile.title,
          candidateEvaluationJSON: mockEvalJSON,
        });

        const body = `Hi Candidate,

Thank you for applying to the ${journey.roleProfile.title} role at ${company.name}. 
While we won't be moving forward at this time, we believe every application should be a learning opportunity.

Here is your personalized AI Recovery Report:

Readiness Score: ${report.readinessScore}%
Performance Rating: ${report.performanceRating}

Strengths:
${report.strengths.map((s: string) => `- ${s}`).join("\n")}

Areas for Improvement:
${report.areasForImprovement.map((a: string) => `- ${a}`).join("\n")}

Skill Gap Analysis (What you need to learn):
${report.skillGapAnalysis.skillsYouNeed.map((s: string) => `- ${s}`).join("\n")}

${report.motivationalSummary}

Keep building! 
- MicroIntern Platform
`;

        await this.mailer.sendEmail({
          to: candidateEmail,
          subject: `Your Application for ${journey.roleProfile.title} - AI Feedback Report`,
          body,
          type: "RECOVERY_REPORT",
        });

        await this.notificationService.createNotification({
          userId: candidate.userId,
          channel: NotificationChannel.IN_APP,
          type: "SYSTEM_ALERT",
          title: "AI Recovery Report Available",
          body: `We have generated an AI Recovery Report based on your application for ${journey.roleProfile.title} at ${company.name}. Check it out to see your skill gaps.`,
        });
      } else if (newStatus === CandidateJourneyStatus.INTERVIEW) {
        // NOTIFY CANDIDATE
        await this.mailer.sendEmail({
          to: candidateEmail,
          subject: `Congratulations! You've been selected for an Interview at ${company.name}`,
          body: `Hi Candidate,\n\nGreat news! Your assessment results were Exceptional. You have advanced to the Technical Interview stage for the ${journey.roleProfile.title} role.\n\nPlease check your dashboard to schedule your interview.\n\nBest,\n${company.name} Hiring Team`,
          type: "INTERVIEW_INVITE",
        });

        // NOTIFY RECRUITER
        await this.mailer.sendEmail({
          to: recruiterEmail,
          subject: `[ACTION REQUIRED] Exceptional Candidate Ready for Interview: Candidate ID ${candidate.id}`,
          body: `Hi Hiring Team,\n\nCandidate (ID: ${candidate.id}) has successfully passed the AI Assessment for ${journey.roleProfile.title} with flying colors.\n\nPlease review their generated Interview Kit and prepare for the technical round.`,
          type: "RECRUITER_ALERT",
        });

        await this.notificationService.createNotification({
          userId: candidate.userId,
          channel: NotificationChannel.IN_APP,
          type: "SYSTEM_ALERT",
          title: "Interview Invitation!",
          body: `Congratulations! Your assessment for ${journey.roleProfile.title} was Exceptional. You are invited to an interview.`,
        });

        for (const recruiter of recruiters) {
          await this.notificationService.createNotification({
            userId: recruiter.userId,
            channel: NotificationChannel.IN_APP,
            type: "SYSTEM_ALERT",
            title: "Candidate Ready for Interview",
            body: `Candidate ${candidate.id} has passed the AI Assessment for ${journey.roleProfile.title} and is ready for the technical round.`,
          });
        }
      } else if (newStatus === CandidateJourneyStatus.HIRED) {
        // TRIGGER PHASE 7 AI ONBOARDING PLAN
        log.info("Candidate HIRED. Triggering AI Onboarding Plan generation...");

        const onboardingPlan = await this.onboardingPlanGenerator.execute(journey.id);

        if (onboardingPlan) {
          const body = `Hi Candidate,

Welcome to ${company.name}! We are thrilled to have you join as our new ${journey.roleProfile.title}.

To ensure you hit the ground running, our AI has generated a customized 30-Day Onboarding Curriculum based on your verified skills and our tech stack.

Skill Gaps to Focus On:
${onboardingPlan.skillGapsIdentified.map((g: string) => `- ${g}`).join("\\n")}

Your 4-Week Plan:
${onboardingPlan.weeklyPlan.map((w: any) => `Week ${w.week}: ${w.focus}\\nTasks: ${w.tasks.join(", ")}`).join("\\n\\n")}

${onboardingPlan.messageToCandidate}

See you on Day 1!
- ${company.name} Team
`;

          await this.mailer.sendEmail({
            to: candidateEmail,
            subject: `Welcome to ${company.name}! Your 30-Day AI Onboarding Plan`,
            body,
            type: "INTERVIEW_INVITE", // Using existing mock type
          });

          // NOTIFY HIRING MANAGER
          await this.mailer.sendEmail({
            to: recruiterEmail,
            subject: `[HIRED] Onboarding Plan Generated for Candidate ID ${candidate.id}`,
            body: `Hi Hiring Team,\n\nCandidate (ID: ${candidate.id}) has accepted the offer for ${journey.roleProfile.title}.\n\nThe AI has automatically generated and sent them a 30-Day Technical Onboarding Plan to close their skill gaps in: ${onboardingPlan.skillGapsIdentified.join(", ")}.\n\nThey are ready for Day 1!`,
            type: "RECRUITER_ALERT",
          });

          await this.notificationService.createNotification({
            userId: candidate.userId,
            channel: NotificationChannel.IN_APP,
            type: "SYSTEM_ALERT",
            title: "Your 30-Day AI Onboarding Plan",
            body: `Welcome to ${company.name}! Your customized 30-Day Onboarding Plan is ready to help you hit the ground running.`,
          });

          for (const recruiter of recruiters) {
            await this.notificationService.createNotification({
              userId: recruiter.userId,
              channel: NotificationChannel.IN_APP,
              type: "SYSTEM_ALERT",
              title: "Onboarding Plan Generated",
              body: `Candidate ${candidate.id} accepted the offer for ${journey.roleProfile.title}. Their 30-Day Technical Onboarding Plan has been generated.`,
            });
          }
        }
      }
    } catch (error) {
      log.error(
        { err: error },
        "Failed to handle CandidateJourneyStatusChanged event in Notification Engine",
      );
    }
  }
}
