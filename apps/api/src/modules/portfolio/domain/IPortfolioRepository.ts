import type {
  CandidatePortfolio,
  PortfolioProject,
  PortfolioAchievement,
  SkillTimelineEntry,
} from "@microintern/database";

export interface CreatePortfolioDTO {
  candidateId: string;
  publicSlug?: string;
  bio?: string;
  aiSummary?: string;
  isPublic?: boolean;
  githubUsername?: string;
  linkedinUrl?: string;
}

export interface AddProjectDTO {
  portfolioId: string;
  title: string;
  description: string;
  projectUrl?: string;
  repoUrl?: string;
  skillsUsed?: string[];
  sortOrder?: number;
}

export interface AddAchievementDTO {
  portfolioId: string;
  title: string;
  description?: string;
  badgeUrl?: string;
}

export interface AddTimelineEntryDTO {
  portfolioId: string;
  eventType: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface IPortfolioRepository {
  findByCandidateId(candidateId: string): Promise<CandidatePortfolio | null>;
  findByPublicSlug(slug: string): Promise<CandidatePortfolio | null>;
  upsert(data: CreatePortfolioDTO): Promise<CandidatePortfolio>;
  update(candidateId: string, data: Partial<CreatePortfolioDTO>): Promise<CandidatePortfolio>;

  // Projects, Achievements, Timeline
  addProject(data: AddProjectDTO): Promise<PortfolioProject>;
  listProjects(portfolioId: string): Promise<PortfolioProject[]>;
  deleteProject(id: string): Promise<void>;

  addAchievement(data: AddAchievementDTO): Promise<PortfolioAchievement>;
  listAchievements(portfolioId: string): Promise<PortfolioAchievement[]>;

  addTimelineEntry(data: AddTimelineEntryDTO): Promise<SkillTimelineEntry>;
  getTimeline(portfolioId: string): Promise<SkillTimelineEntry[]>;
}
