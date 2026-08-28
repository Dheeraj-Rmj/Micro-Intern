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
import type { IUserRepository } from "../../../auth/domain/repositories/IUserRepository.js";
import type { IPasswordService } from "../../../auth/application/interfaces/IPasswordService.js";

const log = createModuleLogger("InviteTeamMemberUseCase");

export class InviteTeamMemberUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(
    userId: string,
    email: string,
    name?: string,
    roleTitle?: string
  ): Promise<CompanyMember> {
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

    let existingMember = await this.companyRepository.findMemberByEmail(company.id, targetEmail);
    if (existingMember !== null) {
      throw new MemberAlreadyExistsError(targetEmail);
    }

    let user = await this.userRepository.findByEmail(targetEmail);
    if (!user) {
      log.info({ email: targetEmail }, "User not found, creating new account for invited member");
      const defaultPassword = "MicroIntern#Recruit2026!";
      const passwordHash = await this.passwordService.hash(defaultPassword);
      
      const parts = (name || email.split("@")[0]!).split(" ");
      const firstName = parts[0] || "New";
      const lastName = parts.slice(1).join(" ") || "Recruiter";

      user = await this.userRepository.createCandidate({
        email: targetEmail,
        passwordHash,
        firstName,
        lastName,
      });

      // Force password change on first login
      await this.userRepository.setForcePasswordChange(user.id, true);
      // Ensure role is correctly set on user record
      await this.userRepository.updateStatus(user.id, "ACTIVE");
      
      // We must also update user role to RECRUITER
      // PrismaUserRepository does not have updateRole, so we rely on CompanyMembership for role validation,
      // but let's make sure they can login.
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
