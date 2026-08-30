import { prisma } from "@/core/database.js";
import { createModuleLogger } from "@/core/logger.js";
import { EncryptionService } from "@/shared/utils/encryption.service.js";

import { CompanyNotFoundError } from "../../domain/errors/company.errors.js";

const log = createModuleLogger("ManageAIProvidersUseCase");

export class ManageAIProvidersUseCase {
  /**
   * Adds or updates a BYOK AI provider for a company.
   * If the provider already exists, it updates the key.
   */
  async addProvider(companyId: string, provider: string, apiKey: string, isFallback = false) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new CompanyNotFoundError(companyId);
    }

    const encryptedApiKey = EncryptionService.encrypt(apiKey);

    const record = await prisma.companyAIProvider.upsert({
      where: {
        companyId_provider: {
          companyId,
          provider,
        },
      },
      create: {
        companyId,
        provider,
        encryptedApiKey,
        isFallback,
        isActive: true,
      },
      update: {
        encryptedApiKey,
        isFallback,
        isActive: true,
      },
    });

    log.info({ companyId, provider }, "Company AI provider added or updated");
    return {
      id: record.id,
      provider: record.provider,
      isActive: record.isActive,
      isFallback: record.isFallback,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Deletes a BYOK AI provider from a company.
   */
  async deleteProvider(companyId: string, provider: string) {
    await prisma.companyAIProvider.deleteMany({
      where: {
        companyId,
        provider,
      },
    });

    log.info({ companyId, provider }, "Company AI provider deleted");
  }

  /**
   * Returns the masked status of all providers for a company.
   * NEVER returns the raw API key.
   */
  async getTenantStatus(companyId: string) {
    const providers = await prisma.companyAIProvider.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    });

    return providers.map((p) => {
      // Just confirm it exists and mask the rest. We can't easily mask decryptable keys unless we decrypt them.
      // But we can just say 'Configured' since this is a secret key.
      return {
        id: p.id,
        provider: p.provider,
        isActive: p.isActive,
        isFallback: p.isFallback,
        status: "Configured", // Masked
        updatedAt: p.updatedAt,
      };
    });
  }
}
