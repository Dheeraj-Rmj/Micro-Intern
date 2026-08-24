import { AI } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";
import { ServiceUnavailableError } from "@/shared/errors/index.js";

import { AIProviderError } from "./interfaces/IAIProvider.js";

import type {
  IAIProvider,
  AICompletionRequest,
  AICompletionResponse,
} from "./interfaces/IAIProvider.js";
import type { AIProvider } from "@microintern/shared";

const log = createModuleLogger("AIFallbackEngine");

/**
 * AI Fallback Engine — the core of the AI Gateway.
 *
 * Design: Implements the Circuit Breaker + Retry pattern across multiple providers.
 *
 * Execution flow for each request:
 * 1. Try primary provider
 * 2. On failure → try each fallback in order
 * 3. Each attempt has exponential backoff retry (up to MAX_RETRIES per provider)
 * 4. If ALL providers fail → throw ServiceUnavailableError
 *
 * Provider selection:
 * - Configured providers are tried first
 * - Unconfigured providers are skipped (no API key)
 * - Provider order: primary → fallbacks (as configured in .env)
 *
 * This design means:
 * - A Groq rate limit → automatically falls to OpenRouter
 * - OpenRouter outage → falls to Gemini
 * - All cloud providers down → falls to local Ollama
 * - Zero manual intervention required
 */
export class AIFallbackEngine {
  constructor(private readonly providers: IAIProvider[]) {
    const configured = providers.filter((p) => p.isConfigured());
    log.info(
      { providers: configured.map((p) => p.name) },
      `AI Gateway initialized with ${configured.length} provider(s)`,
    );
  }

  /**
   * Execute a completion request with automatic fallback.
   */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const configuredProviders = this.providers.filter((p) => p.isConfigured());

    if (configuredProviders.length === 0) {
      throw new ServiceUnavailableError(
        "No AI providers are configured. Set at least one API key.",
        "AI_ALL_PROVIDERS_FAILED",
      );
    }

    const errors: Array<{ provider: AIProvider; error: string }> = [];

    for (const provider of configuredProviders) {
      try {
        const result = await this.executeWithRetry(provider, request);
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push({ provider: provider.name, error: message });

        log.warn(
          { provider: provider.name, error: message },
          `Provider failed — trying next fallback`,
        );
      }
    }

    // All providers failed
    log.error({ errors }, "All AI providers failed");

    throw new ServiceUnavailableError(
      `All AI providers failed. Last errors: ${errors.map((e) => `${e.provider}: ${e.error}`).join("; ")}`,
      "AI_ALL_PROVIDERS_FAILED",
    );
  }

  /**
   * Execute with exponential backoff retry for a single provider.
   */
  private async executeWithRetry(
    provider: IAIProvider,
    request: AICompletionRequest,
  ): Promise<AICompletionResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= AI.MAX_RETRIES; attempt++) {
      try {
        const result = await provider.complete(request);

        if (attempt > 1) {
          log.info({ provider: provider.name, attempt }, "Provider succeeded after retry");
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const isRetryable = !(error instanceof AIProviderError && !error.isRetryable);

        if (!isRetryable || attempt === AI.MAX_RETRIES) {
          throw lastError;
        }

        const backoffMs = AI.RETRY_BACKOFF_MS * Math.pow(2, attempt - 1); // Exponential backoff
        log.warn(
          { provider: provider.name, attempt, backoffMs },
          `Retry attempt ${attempt}/${AI.MAX_RETRIES}`,
        );

        await sleep(backoffMs);
      }
    }

    throw lastError ?? new Error("Unknown retry failure");
  }

  /**
   * Health check all configured providers in parallel.
   */
  async healthCheckAll() {
    const providers = this.providers.filter((p) => p.isConfigured());
    return await Promise.all(providers.map((p) => p.healthCheck()));
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
