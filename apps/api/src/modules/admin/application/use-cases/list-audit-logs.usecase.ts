import { createModuleLogger } from '@/core/logger.js';
import type { IAdminRepository } from '../ports/IAdminRepository.js';

const log = createModuleLogger('ListAuditLogsUseCase');

export class ListAuditLogsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(filters: { search?: string; severity?: string }): Promise<any[]> {
    log.info({ filters }, 'Listing compliance audit logs');
    return this.adminRepository.listAuditLogs(filters);
  }
}
