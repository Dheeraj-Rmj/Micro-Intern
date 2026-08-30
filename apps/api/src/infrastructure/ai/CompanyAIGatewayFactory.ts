import { AIProvider } from "@microintern/shared";

import { prisma } from "@/core/database.js";
import { createModuleLogger } from "@/core/logger.js";
import { EncryptionService } from "@/shared/utils/encryption.service.js";

import { AIFallbackEngine } from "./AIFallbackEngine.js";
import { GeminiProvider } from "./providers/GeminiProvider.js";
import { GroqProvider } from "./providers/GroqProvider.js";
import { OllamaProvider } from "./providers/OllamaProvider.js";
import { OpenRouterProvider } from "./providers/OpenRouterProvider.js";
import { OpenAIProvider } from "./providers/OpenAIProvider.js";
import { AnthropicProvider } from "./providers/AnthropicProvider.js";
import { MistralProvider } from "./providers/MistralProvider.js";
import { createAIGateway } from "./index.js";

import type { IAIProvider } from "./interfaces/IAIProvider.js";

const log = createModuleLogger("CompanyAIGatewayFactory");

/**
 * Factory for creating tenant-specific AI Gateways.
 * Reads the company's encrypted BYOK API keys, decrypts them,
 * and configures an isolated AIFallbackEngine.
 */
export class CompanyAIGatewayFactory {
  /**
   * Retrieves an AIFallbackEngine tailored for the specified company.
   * If the company has no custom providers configured, it falls back to the
   * platform default AI Gateway.
   *
   * @param companyId The ID of the company
   */
  static async getGatewayForCompany(companyId: string): Promise<AIFallbackEngine> {
    const providers = await prisma.companyAIProvider.findMany({
      where: {
        companyId,
        isActive: true,
      },
    });

    if (providers.length === 0) {
      log.info({ companyId }, "No custom AI providers found, falling back to platform defaults");
      return createAIGateway();
    }

    const aiProviders: IAIProvider[] = [];

    // Sort so non-fallback (primary) comes first
    providers.sort((a, b) => (a.isFallback === b.isFallback ? 0 : a.isFallback ? 1 : -1));

    for (const p of providers) {
      try {
        const decryptedKey = EncryptionService.decrypt(p.encryptedApiKey);
        
        switch (p.provider) {
          case AIProvider.GROQ:
            aiProviders.push(new GroqProvider(decryptedKey));
            break;
          case AIProvider.OPENROUTER:
            aiProviders.push(new OpenRouterProvider(decryptedKey));
            break;
          case AIProvider.GEMINI:
            aiProviders.push(new GeminiProvider(decryptedKey));
            break;
          case AIProvider.OPENAI:
            aiProviders.push(new OpenAIProvider(decryptedKey));
            break;
          case AIProvider.ANTHROPIC:
            aiProviders.push(new AnthropicProvider(decryptedKey));
            break;
          case AIProvider.MISTRAL:
            aiProviders.push(new MistralProvider(decryptedKey));
            break;
          default:
            log.warn({ companyId, provider: p.provider }, "Unsupported BYOK provider type");
        }
      } catch (error) {
        log.error({ companyId, provider: p.provider, err: error }, "Failed to decrypt or initialize custom provider");
      }
    }

    if (aiProviders.length === 0) {
      log.warn({ companyId }, "Custom providers failed to initialize, falling back to platform defaults");
      return createAIGateway();
    }

    // Include platform Ollama as ultimate local fallback if desired?
    // Actually, strict BYOK means we ONLY use what they gave us. If they fail, they fail.
    // We will let it fail if all their custom keys fail, to maintain strict tenant boundaries.

    log.info({ companyId, configuredCount: aiProviders.length }, "Initialized custom AI Gateway for company");
    return new AIFallbackEngine(aiProviders);
  }
}
