import { createModuleLogger } from "@/core/logger.js";

import { CompanyNotFoundError, NotCompanyOwnerError } from "../../domain/errors/company.errors.js";

import type { Company } from "../../domain/entities/Company.entity.js";
import type { ICompanyRepository } from "../../domain/repositories/ICompanyRepository.js";
import type { UpdateCompanyInput } from "@microintern/shared";

const log = createModuleLogger("UpdateCompanyUseCase");

export class UpdateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(userId: string, input: UpdateCompanyInput): Promise<Company> {
    log.info({ userId }, "Attempting to update company settings");

    const company = await this.companyRepository.findByUserId(userId);
    if (company === null) {
      throw new CompanyNotFoundError();
    }

    const member = await this.companyRepository.findMember(company.id, userId);
    if (member?.isOwner() !== true) {
      throw new NotCompanyOwnerError();
    }

    const updated = await this.companyRepository.update(company.id, input);
    log.info({ companyId: company.id, userId }, "Company updated successfully");

    return updated;
  }
}
