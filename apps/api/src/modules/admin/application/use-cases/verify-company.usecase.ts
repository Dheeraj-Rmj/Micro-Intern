import { EntityStatus } from '@microintern/shared';

import { createModuleLogger } from '@/core/logger.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { AdminCompanyNotFoundError, CompanyAlreadyVerifiedError } from '../../domain/index.js';

import type { IAdminRepository, CompanySummary } from '../ports/IAdminRepository.js';

const log = createModuleLogger('VerifyCompanyUseCase');

export class VerifyCompanyUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(adminUserId: string, companyId: string): Promise<CompanySummary> {
    log.info({ adminUserId, companyId }, 'Attempting to verify employer company account');

    const company = await this.adminRepository.findCompanyById(companyId);
    if (company === null) {
      throw new AdminCompanyNotFoundError(companyId);
    }

    if (company.status === EntityStatus.ACTIVE) {
      throw new CompanyAlreadyVerifiedError(companyId);
    }

    const updated = await this.adminRepository.updateCompanyStatus(companyId, EntityStatus.ACTIVE);
    log.info({ companyId, slug: updated.slug }, 'Company verified successfully');

    void eventBus.emit(DOMAIN_EVENTS.COMPANY_VERIFIED, {
      companyId: updated.id,
      companyName: updated.name,
      verifiedBy: adminUserId,
    });

    return updated;
  }
}
