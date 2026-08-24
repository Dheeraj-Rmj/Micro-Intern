import { createModuleLogger } from "@/core/logger.js";

import { CompanyNotFoundError } from "../../domain/errors/company.errors.js";

import type { Company } from "../../domain/entities/Company.entity.js";
import type { ICompanyRepository } from "../../domain/repositories/ICompanyRepository.js";

const log = createModuleLogger("GetContextCompanyUseCase");

export class GetContextCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(userId: string): Promise<Company> {
    log.info({ userId }, "Fetching context company");

    const company = await this.companyRepository.findByUserId(userId);
    if (company === null) {
      throw new CompanyNotFoundError();
    }

    return company;
  }
}
