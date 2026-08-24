import { Role } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

import {
  CompanyNotFoundError,
  NotCompanyOwnerError,
  MemberAlreadyExistsError,
} from "../../domain/errors/company.errors.js";

import type { CompanyMember } from "../../domain/entities/CompanyMember.entity.js";
import type { ICompanyRepository } from "../../domain/repositories/ICompanyRepository.js";

const log = createModuleLogger("InviteTeamMemberUseCase");

export class InviteTeamMemberUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(userId: string, email: string): Promise<CompanyMember> {
    const targetEmail = email.toLowerCase().trim();
    log.info({ userId, email: targetEmail }, "Attempting to invite team member");

    const company = await this.companyRepository.findByUserId(userId);
    if (company === null) {
      throw new CompanyNotFoundError();
    }

    const member = await this.companyRepository.findMember(company.id, userId);
    if (member?.isOwner() !== true) {
      throw new NotCompanyOwnerError();
    }

    const existingMember = await this.companyRepository.findMemberByEmail(company.id, targetEmail);
    if (existingMember !== null) {
      throw new MemberAlreadyExistsError(targetEmail);
    }

    const newMember = await this.companyRepository.inviteMember(
      company.id,
      targetEmail,
      Role.RECRUITER,
      userId,
    );

    log.info(
      { companyId: company.id, invitedEmail: targetEmail, memberId: newMember.id },
      "Team member invited in repository",
    );

    await eventBus.emit(DOMAIN_EVENTS.COMPANY_MEMBER_INVITED, {
      companyId: company.id,
      companyName: company.name,
      invitedByUserId: userId,
      email: targetEmail,
      role: Role.RECRUITER,
      memberId: newMember.id,
    });

    return newMember;
  }
}
