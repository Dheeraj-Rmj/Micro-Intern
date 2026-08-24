import type { IAdminRepository } from "../ports/IAdminRepository.js";

export class GetSubscriptionMetricsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<any> {
    return this.adminRepository.getSubscriptionMetrics();
  }
}
