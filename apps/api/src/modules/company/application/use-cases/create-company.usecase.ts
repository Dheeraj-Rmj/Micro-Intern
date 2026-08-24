import { createModuleLogger } from "@/core/logger.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

import { CompanyAlreadyExistsError } from "../../domain/errors/company.errors.js";

import type { Company } from "../../domain/entities/Company.entity.js";
import type { ICompanyRepository } from "../../domain/repositories/ICompanyRepository.js";
import type { CreateCompanyInput } from "@microintern/shared";

const log = createModuleLogger("CreateCompanyUseCase");

export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(userId: string, input: CreateCompanyInput): Promise<Company> {
    log.info({ userId, name: input.name }, "Attempting to create company");

    // 1. Verify user doesn't already belong to an active company
    const existing = await this.companyRepository.findByUserId(userId);
    if (existing !== null) {
      log.warn({ userId, existingCompanyId: existing.id }, "User already belongs to a company");
      throw new CompanyAlreadyExistsError();
    }

    // 2. Generate slug from company name
    const baseSlug = input.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    let slug = baseSlug !== "" ? baseSlug : `company-${Date.now()}`;

    // Ensure slug uniqueness if necessary
    const existingSlug = await this.companyRepository.findBySlug(slug);
    if (existingSlug !== null) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 3. Create company and link user as owner
    const company = await this.companyRepository.create(input, slug, userId);
    log.info({ userId, companyId: company.id }, "Company created successfully");

    // 4. Emit domain event
    await eventBus.emit(DOMAIN_EVENTS.COMPANY_CREATED, {
      companyId: company.id,
      ownerUserId: userId,
      name: company.name,
      slug: company.slug,
    });

    return company;
  }
}
