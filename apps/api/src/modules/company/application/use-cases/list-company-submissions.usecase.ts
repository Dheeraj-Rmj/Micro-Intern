import { UnauthorizedError } from "@/shared/errors/index.js";
import { buildPaginationMeta } from "@/shared/response/ResponseFormatter.js";

export class ListCompanySubmissionsUseCase {
  constructor(private readonly prisma: any) {}

  async execute(companyId: string, query: any) {
    if (!companyId) throw new UnauthorizedError("Company ID required");

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {
      assessment: { companyId },
    };

    const [total, submissions] = await Promise.all([
      this.prisma.submission.count({ where }),
      this.prisma.submission.findMany({
        where,
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          assessment: {
            select: { title: true },
          },
          evaluation: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const formattedSubmissions = submissions.map((sub: any) => ({
      id: sub.id,
      candidateName: `${sub.candidate.user.firstName} ${sub.candidate.user.lastName}`,
      email: sub.candidate.user.email,
      avatarUrl: sub.candidate.user.avatarUrl,
      trialTitle: sub.assessment.title,
      trustScore: sub.integrityScore || 95,
      submittedAt: sub.submittedAt || sub.createdAt,
      githubUrl: "https://github.com/candidate", // mock until github integration
      status:
        sub.status === "EVALUATED" || sub.status === "PASSED"
          ? "APPROVED"
          : sub.status === "REJECTED"
            ? "REJECTED"
            : "PENDING",
      aiRecommendation:
        sub.evaluation?.aiRecommendation || (sub.isPassed ? "STRONG_HIRE" : "REVIEW_NEEDED"),
    }));

    return {
      submissions: formattedSubmissions,
      pagination: buildPaginationMeta({ page, limit, total }),
    };
  }
}
