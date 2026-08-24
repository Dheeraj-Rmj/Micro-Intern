import { PrismaClient } from "@microintern/database";
import type {
  CandidatePortfolio,
  PortfolioProject,
  PortfolioAchievement,
  SkillTimelineEntry,
} from "@microintern/database";
import type {
  IPortfolioRepository,
  CreatePortfolioDTO,
  AddProjectDTO,
  AddAchievementDTO,
  AddTimelineEntryDTO,
} from "../domain/IPortfolioRepository.js";

export class PrismaPortfolioRepository implements IPortfolioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCandidateId(candidateId: string): Promise<CandidatePortfolio | null> {
    return this.prisma.candidatePortfolio.findUnique({
      where: { candidateId },
      include: {
        projects: { orderBy: { sortOrder: "asc" } },
        achievements: { orderBy: { issuedAt: "desc" } },
        timeline: { orderBy: { timestamp: "desc" } },
      } as any,
    });
  }

  async findByPublicSlug(slug: string): Promise<CandidatePortfolio | null> {
    return this.prisma.candidatePortfolio.findUnique({
      where: { publicSlug: slug },
      include: {
        projects: { orderBy: { sortOrder: "asc" } },
        achievements: { orderBy: { issuedAt: "desc" } },
        timeline: { orderBy: { timestamp: "desc" } },
      } as any,
    });
  }

  async upsert(data: CreatePortfolioDTO): Promise<CandidatePortfolio> {
    return this.prisma.candidatePortfolio.upsert({
      where: { candidateId: data.candidateId },
      update: {
        publicSlug: data.publicSlug,
        bio: data.bio,
        aiSummary: data.aiSummary,
        isPublic: data.isPublic,
        githubUsername: data.githubUsername,
        linkedinUrl: data.linkedinUrl,
      },
      create: {
        candidateId: data.candidateId,
        publicSlug: data.publicSlug,
        bio: data.bio,
        aiSummary: data.aiSummary,
        isPublic: data.isPublic ?? true,
        githubUsername: data.githubUsername,
        linkedinUrl: data.linkedinUrl,
      },
      include: {
        projects: true,
        achievements: true,
        timeline: true,
      } as any,
    });
  }

  async update(
    candidateId: string,
    data: Partial<CreatePortfolioDTO>,
  ): Promise<CandidatePortfolio> {
    return this.prisma.candidatePortfolio.update({
      where: { candidateId },
      data: {
        publicSlug: data.publicSlug,
        bio: data.bio,
        aiSummary: data.aiSummary,
        isPublic: data.isPublic,
        githubUsername: data.githubUsername,
        linkedinUrl: data.linkedinUrl,
      },
      include: {
        projects: true,
        achievements: true,
        timeline: true,
      } as any,
    });
  }

  async addProject(data: AddProjectDTO): Promise<PortfolioProject> {
    return this.prisma.portfolioProject.create({
      data: {
        portfolioId: data.portfolioId,
        title: data.title,
        description: data.description,
        projectUrl: data.projectUrl,
        repoUrl: data.repoUrl,
        skillsUsed: data.skillsUsed ?? [],
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async listProjects(portfolioId: string): Promise<PortfolioProject[]> {
    return this.prisma.portfolioProject.findMany({
      where: { portfolioId },
      orderBy: { sortOrder: "asc" },
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.prisma.portfolioProject.delete({
      where: { id },
    });
  }

  async addAchievement(data: AddAchievementDTO): Promise<PortfolioAchievement> {
    return this.prisma.portfolioAchievement.create({
      data: {
        portfolioId: data.portfolioId,
        title: data.title,
        description: data.description,
        badgeUrl: data.badgeUrl,
      },
    });
  }

  async listAchievements(portfolioId: string): Promise<PortfolioAchievement[]> {
    return this.prisma.portfolioAchievement.findMany({
      where: { portfolioId },
      orderBy: { issuedAt: "desc" },
    });
  }

  async addTimelineEntry(data: AddTimelineEntryDTO): Promise<SkillTimelineEntry> {
    return this.prisma.skillTimelineEntry.create({
      data: {
        portfolioId: data.portfolioId,
        eventType: data.eventType,
        title: data.title,
        description: data.description,
        metadata: (data.metadata || {}) as any,
      },
    });
  }

  async getTimeline(portfolioId: string): Promise<SkillTimelineEntry[]> {
    return this.prisma.skillTimelineEntry.findMany({
      where: { portfolioId },
      orderBy: { timestamp: "desc" },
    });
  }
}
