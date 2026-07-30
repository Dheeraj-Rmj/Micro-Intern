import type {
  IPortfolioRepository,
  CreatePortfolioDTO,
  AddProjectDTO,
  AddAchievementDTO,
  AddTimelineEntryDTO,
} from '../domain/IPortfolioRepository.js';
import type { CandidatePortfolio, PortfolioProject, PortfolioAchievement, SkillTimelineEntry } from '@microintern/database';

export class PortfolioService {
  constructor(private readonly portfolioRepo: IPortfolioRepository) {}

  async getPortfolioByCandidateId(candidateId: string): Promise<CandidatePortfolio> {
    let portfolio = await this.portfolioRepo.findByCandidateId(candidateId);
    if (!portfolio) {
      portfolio = await this.portfolioRepo.upsert({
        candidateId,
        publicSlug: `candidate-${candidateId.slice(0, 8)}`,
        isPublic: true,
      });
    }
    return portfolio;
  }

  async getPublicProfile(slug: string): Promise<CandidatePortfolio> {
    const portfolio = await this.portfolioRepo.findByPublicSlug(slug);
    if (!portfolio || !portfolio.isPublic) {
      throw new Error(`Public profile not found for slug: ${slug}`);
    }
    return portfolio;
  }

  async updatePortfolio(candidateId: string, data: Partial<CreatePortfolioDTO>): Promise<CandidatePortfolio> {
    const existing = await this.getPortfolioByCandidateId(candidateId);
    return this.portfolioRepo.update(existing.candidateId, data);
  }

  async addProject(candidateId: string, data: Omit<AddProjectDTO, 'portfolioId'>): Promise<PortfolioProject> {
    const portfolio = await this.getPortfolioByCandidateId(candidateId);
    const project = await this.portfolioRepo.addProject({
      ...data,
      portfolioId: portfolio.id,
    });

    await this.portfolioRepo.addTimelineEntry({
      portfolioId: portfolio.id,
      eventType: 'PROJECT_ADDED',
      title: `Added project: ${data.title}`,
      description: data.description,
    });

    return project;
  }

  async addAchievement(
    candidateId: string,
    data: Omit<AddAchievementDTO, 'portfolioId'>
  ): Promise<PortfolioAchievement> {
    const portfolio = await this.getPortfolioByCandidateId(candidateId);
    const achievement = await this.portfolioRepo.addAchievement({
      ...data,
      portfolioId: portfolio.id,
    });

    await this.portfolioRepo.addTimelineEntry({
      portfolioId: portfolio.id,
      eventType: 'ACHIEVEMENT_EARNED',
      title: `Earned achievement: ${data.title}`,
      description: data.description,
    });

    return achievement;
  }

  async addTimelineEntry(candidateId: string, data: Omit<AddTimelineEntryDTO, 'portfolioId'>): Promise<SkillTimelineEntry> {
    const portfolio = await this.getPortfolioByCandidateId(candidateId);
    return this.portfolioRepo.addTimelineEntry({
      ...data,
      portfolioId: portfolio.id,
    });
  }

  async getTimeline(candidateId: string): Promise<SkillTimelineEntry[]> {
    const portfolio = await this.getPortfolioByCandidateId(candidateId);
    return this.portfolioRepo.getTimeline(portfolio.id);
  }
}
