import { createModuleLogger } from "@/core/logger.js";

import {
  CompanyNotFoundError,
  NotCompanyOwnerError,
  MemberNotFoundError,
  CannotRemoveOwnerError,
} from "../../domain/errors/company.errors.js";

import type { ICompanyRepository } from "../../domain/repositories/ICompanyRepository.js";

const log = createModuleLogger("RemoveTeamMemberUseCase");

export class RemoveTeamMemberUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(requestingUserId: string, targetUserId: string): Promise<void> {
    log.info({ requestingUserId, targetUserId }, "Attempting to remove team member");

    const company = await this.companyRepository.findByUserId(requestingUserId);
    if (company === null) {
      throw new CompanyNotFoundError();
    }

    const requestingMember = await this.companyRepository.findMember(company.id, requestingUserId);
    if (requestingMember?.isOwner() !== true) {
      throw new NotCompanyOwnerError();
    }

    const targetMember = await this.companyRepository.findMember(company.id, targetUserId);
    if (targetMember === null) {
      throw new MemberNotFoundError(targetUserId);
    }

    if (targetMember.isOwner() || targetUserId === requestingUserId) {
      throw new CannotRemoveOwnerError();
    }

    const removed = await this.companyRepository.removeMember(company.id, targetUserId);
    if (!removed) {
      throw new MemberNotFoundError(targetUserId);
    }

    log.info({ companyId: company.id, targetUserId }, "Team member removed successfully");
  }
}
