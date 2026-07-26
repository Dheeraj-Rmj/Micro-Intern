import { createModuleLogger } from '@/core/logger.js';
import { CompanyNotFoundError } from '@/modules/company/domain/errors/company.errors.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import type { Trial } from '../../domain/entities/Trial.entity.js';
import type { ITrialRepository, CreateTrialData } from '../ports/ITrialRepository.js';
import type { ICompanyRepository } from '@/modules/company/domain/repositories/ICompanyRepository.js';
import type { ExperienceLevel } from '@microintern/database';

const log = createModuleLogger('CreateTrialUseCase');

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export class CreateTrialUseCase {
  constructor(
    private readonly trialRepository: ITrialRepository,
    private readonly companyRepository: ICompanyRepository
  ) {}

  async execute(
    userId: string,
    input: {
      title: string;
      description: string;
      instructions: string;
      skillsRequired?: string[];
      roleTitle?: string;
      level?: ExperienceLevel;
      durationMinutes: number;
      passingScore?: number;
      maxAttempts?: number;
      isPublic?: boolean;
      tasks?: Array<{
        title: string;
        description: string;
        taskType: string;
        isRequired?: boolean;
        maxPoints?: number;
        sortOrder: number;
        config?: Record<string, unknown>;
      }>;
    }
  ): Promise<Trial> {
    log.info({ userId, title: input.title }, 'Creating new assessment trial');

    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new CompanyNotFoundError();
    }

    let slug = slugify(input.title);
    const existing = await this.trialRepository.findBySlug(slug);
    if (existing && existing.companyId === company.id) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      slug = `${slug}-${suffix}`;
    }

    const trialData: CreateTrialData = {
      companyId: company.id,
      createdById: userId,
      title: input.title.trim(),
      slug,
      description: input.description,
      instructions: input.instructions,
      skillsRequired: input.skillsRequired || [],
      roleTitle: input.roleTitle,
      level: input.level,
      durationMinutes: input.durationMinutes,
      passingScore: input.passingScore ?? 70,
      maxAttempts: input.maxAttempts ?? 1,
      isPublic: input.isPublic ?? false,
      tasks: input.tasks,
    };

    const trial = await this.trialRepository.create(trialData);
    log.info({ trialId: trial.id, companyId: company.id }, 'Trial created in DRAFT status');

    await eventBus.emit(DOMAIN_EVENTS.TRIAL_CREATED, {
      trialId: trial.id,
      companyId: company.id,
      title: trial.title,
      slug: trial.slug,
      createdById: userId,
    });

    return trial;
  }
}
