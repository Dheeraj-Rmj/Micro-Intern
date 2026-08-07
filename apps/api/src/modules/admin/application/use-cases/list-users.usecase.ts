import { createModuleLogger } from '@/core/logger.js';
import type { IAdminRepository } from '../ports/IAdminRepository.js';

const log = createModuleLogger('ListUsersUseCase');

export class ListUsersUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(filters: { search?: string; role?: string }): Promise<any[]> {
    log.info({ filters }, 'Listing platform users');
    return this.adminRepository.listUsers(filters);
  }
}
