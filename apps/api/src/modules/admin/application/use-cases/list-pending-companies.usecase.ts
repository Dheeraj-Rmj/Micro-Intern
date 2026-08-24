import { createModuleLogger } from "@/core/logger.js";

import type { IAdminRepository, CompanySummary } from "../ports/IAdminRepository.js";

const log = createModuleLogger("ListPendingCompaniesUseCase");

export class ListPendingCompaniesUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<CompanySummary[]> {
    log.info("Listing companies awaiting administrative verification");
    return await this.adminRepository.listPendingCompanies();
  }
}
