import { createModuleLogger } from '@/core/logger.js';

import { PlatformStats } from '../../domain/index.js';

import type { IAdminRepository } from '../ports/IAdminRepository.js';

const log = createModuleLogger('GetPlatformStatsUseCase');

export class GetPlatformStatsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<Record<string, unknown>> {
    log.info('Fetching aggregate platform monitoring statistics');
    const props = await this.adminRepository.getPlatformStatsProps();
    const stats = new PlatformStats(props);
    return stats.toJSON();
  }
}
