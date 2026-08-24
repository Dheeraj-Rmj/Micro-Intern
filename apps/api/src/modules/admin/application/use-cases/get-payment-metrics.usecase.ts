import type { IAdminRepository } from "../ports/IAdminRepository.js";

export class GetPaymentMetricsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<any> {
    return this.adminRepository.getPaymentMetrics();
  }
}
