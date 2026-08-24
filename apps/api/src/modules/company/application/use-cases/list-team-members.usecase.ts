import { createModuleLogger } from "@/core/logger.js";
import { buildPaginationMeta, toPrismaPage } from "@/shared/response/ResponseFormatter.js";

import { CompanyNotFoundError } from "../../domain/errors/company.errors.js";

import type { CompanyMember } from "../../domain/entities/CompanyMember.entity.js";
import type { ICompanyRepository } from "../../domain/repositories/ICompanyRepository.js";
import type { PaginationMeta } from "@microintern/shared";

const log = createModuleLogger("ListTeamMembersUseCase");

export class ListTeamMembersUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(
    userId: string,
    query: { page?: number; limit?: number },
  ): Promise<{ members: CompanyMember[]; pagination: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    log.info({ userId, page, limit }, "Listing company team members");

    const company = await this.companyRepository.findByUserId(userId);
    if (company === null) {
      throw new CompanyNotFoundError();
    }

    const paginationInput = toPrismaPage(page, limit);
    const { members, total } = await this.companyRepository.listMembers(
      company.id,
      paginationInput,
    );

    const pagination = buildPaginationMeta({ page, limit, total });

    return { members, pagination };
  }
}
