import { AIProvider } from "@microintern/shared";

import { config } from "@/core/config.js";
import { createModuleLogger } from "@/core/logger.js";

import { AIProviderError } from "../interfaces/IAIProvider.js";

import type {
  IAIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIProviderHealth,
} from "../interfaces/IAIProvider.js";

const log = createModuleLogger("OpenRouterProvider");

/**
 * OpenRouter Provider — second fallback.
 *
 * OpenRouter is an OpenAI-compatible API that provides access to 100+ models
 * across multiple providers (Anthropic, Meta, Mistral, etc.) under one API key.
 * Excellent for cost-optimized fallback.
 */
export class OpenRouterProvider implements IAIProvider {
  readonly name = AIProvider.OPENROUTER;
  readonly defaultModel = config.OPENROUTER_DEFAULT_MODEL;
  private readonly baseUrl = "https://openrouter.ai/api/v1";

  isConfigured(): boolean {
    return config.OPENROUTER_API_KEY !== undefined && config.OPENROUTER_API_KEY.length > 0;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isConfigured()) {
      throw new AIProviderError(AIProvider.OPENROUTER, "OpenRouter API key not configured", false);
    }

    const start = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
          "HTTP-Referer": config.OPENROUTER_SITE_URL ?? "https://microintern.io",
          "X-Title": config.OPENROUTER_SITE_NAME ?? "MicroIntern",
        },
        body: JSON.stringify({
          model: request.model ?? this.defaultModel,
          messages: request.messages,
          max_tokens: request.maxTokens ?? 8192,
          temperature: request.temperature ?? 0.1,
          top_p: request.topP ?? 1,
          response_format: request.responseFormat,
          stream: false,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const isRateLimited = response.status === 429;
        throw new AIProviderError(
          AIProvider.OPENROUTER,
          `OpenRouter API error ${response.status}: ${errorBody}`,
          isRateLimited,
        );
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string }; finish_reason: string }>;
        model: string;
        usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      };

      const choice = data.choices[0];
      if (choice === undefined) {
        throw new AIProviderError(AIProvider.OPENROUTER, "No completion choices returned", true);
      }

      return {
        content: choice.message.content,
        model: data.model,
        provider: AIProvider.OPENROUTER,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        latencyMs: Date.now() - start,
        finishReason: (choice.finish_reason as AICompletionResponse["finishReason"]) ?? "stop",
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      log.warn({ err: error }, "OpenRouter API error");
      throw new AIProviderError(
        AIProvider.OPENROUTER,
        error instanceof Error ? error.message : "OpenRouter request failed",
        true,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async healthCheck(): Promise<AIProviderHealth> {
    if (!this.isConfigured()) {
      return {
        provider: AIProvider.OPENROUTER,
        status: "unavailable",
        error: "Not configured",
        checkedAt: new Date(),
      };
    }
    const start = Date.now();
    try {
      await this.complete({ messages: [{ role: "user", content: "Reply ok" }], maxTokens: 5 });
      return {
        provider: AIProvider.OPENROUTER,
        status: "available",
        latencyMs: Date.now() - start,
        checkedAt: new Date(),
      };
    } catch {
      return {
        provider: AIProvider.OPENROUTER,
        status: "unavailable",
        latencyMs: Date.now() - start,
        error: "Health check failed",
        checkedAt: new Date(),
      };
    }
  }
}
