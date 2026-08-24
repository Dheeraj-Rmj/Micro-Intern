import type { IAdminRepository } from "../ports/IAdminRepository.js";

export class GetEscrowMetricsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<any> {
    return this.adminRepository.getEscrowMetrics();
  }
}
