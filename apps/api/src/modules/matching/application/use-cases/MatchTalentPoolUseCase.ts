import { PrismaClient } from "@microintern/database";
import { createModuleLogger } from "@/core/logger.js";
import { SkillMatchingService } from "../SkillMatchingService.js";
import type { IMailerService } from "../../../notifications/infrastructure/MockMailerService.js";

const log = createModuleLogger("MatchTalentPoolUseCase");

export class MatchTalentPoolUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly matchingService: SkillMatchingService,
    private readonly mailer: IMailerService,
  ) {}

  public async execute(roleProfileId: string, companyId: string): Promise<void> {
    log.info({ roleProfileId, companyId }, "Scanning Talent Pools for new role matches...");

    // 1. Find all Talent Pools for this company
    const pools = await this.prisma.talentPool.findMany({
      where: { companyId },
      include: {
        candidates: {
          include: {
            candidate: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (pools.length === 0) {
      log.info("No talent pools found for company.");
      return;
    }

    const role = await this.prisma.roleProfile.findUnique({ where: { id: roleProfileId } });
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!role || !company) return;

    // 2. Iterate candidates
    let matchesFound = 0;

    for (const pool of pools) {
      for (const tpCandidate of pool.candidates) {
        try {
          const matchResult = await this.matchingService.matchCandidateToRole(
            roleProfileId,
            tpCandidate.candidateId,
          );

          if (
            matchResult.recommendation === "STRONG_MATCH" ||
            matchResult.recommendation === "POTENTIAL_MATCH"
          ) {
            matchesFound++;

            // Save match score
            await this.prisma.talentPoolCandidate.update({
              where: { id: tpCandidate.id },
              data: { matchScore: matchResult.overallMatchScore },
            });

            // Email the candidate to invite them to apply again
            const body = `Hi ${tpCandidate.candidate.user.firstName},

Great news! We just opened a new role for a ${role.title} at ${company.name}.
Based on your past applications and verified skills in our Talent Pool, our AI has identified you as a ${matchResult.recommendation.replace("_", " ")}!

Your current Skill Match Percentage is ${matchResult.skillMatchPercentage.toFixed(0)}%.

We would love for you to apply for this new opportunity and skip the initial resume screen.

Best,
${company.name} Talent Team
`;

            await this.mailer.sendEmail({
              to: tpCandidate.candidate.user.email,
              subject: `New Role Open at ${company.name} - We think you're a great fit!`,
              body,
              type: "INTERVIEW_INVITE", // We mock type
            });

            log.info(
              { candidateId: tpCandidate.candidateId, score: matchResult.overallMatchScore },
              "Talent pool candidate invited to apply.",
            );
          }
        } catch (error) {
          log.warn(
            { candidateId: tpCandidate.candidateId, err: error },
            "Failed to evaluate talent pool candidate.",
          );
        }
      }
    }

    log.info({ roleProfileId, matchesFound }, "Talent pool matching complete.");
  }
}
