import { ValidationError } from "@/shared/errors/index.js";
import type { PrismaAdminRepository } from "../../infrastructure/repositories/PrismaAdminRepository.js";

export class CreateCompanyManuallyUseCase {
  constructor(private readonly adminRepository: PrismaAdminRepository) {}

  async execute(adminId: string, data: { companyName: string; adminEmail: string; adminName: string }): Promise<any> {
    if (!data.companyName || !data.adminEmail || !data.adminName) {
      throw new ValidationError("Missing required fields for company creation");
    }

    return await this.adminRepository.createCompanyManually(data);
  }
}
