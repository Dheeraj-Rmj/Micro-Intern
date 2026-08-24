import { createModuleLogger } from "@/core/logger.js";
import type { IAdminRepository } from "../ports/IAdminRepository.js";

const log = createModuleLogger("ListTrialsUseCase");

export class ListTrialsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(filters: { search?: string; status?: string }): Promise<any[]> {
    log.info({ filters }, "Listing platform active trials");
    return this.adminRepository.listTrials(filters);
  }
}
