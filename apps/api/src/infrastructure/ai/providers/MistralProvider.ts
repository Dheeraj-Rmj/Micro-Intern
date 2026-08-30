import { AIProvider } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";
import { AIProviderError } from "../interfaces/IAIProvider.js";

import type {
  IAIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIProviderHealth,
} from "../interfaces/IAIProvider.js";

const log = createModuleLogger("MistralProvider");

export class MistralProvider implements IAIProvider {
  readonly name = AIProvider.MISTRAL;
  readonly defaultModel = "mistral-small-latest";
  private readonly baseUrl = "https://api.mistral.ai/v1";
  private readonly apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return this.apiKey !== undefined && this.apiKey.length > 0;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isConfigured()) {
      throw new AIProviderError(AIProvider.MISTRAL, "Mistral API key not configured", false);
    }

    const start = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model ?? this.defaultModel,
          messages: request.messages,
          max_tokens: request.maxTokens ?? 4096,
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
          AIProvider.MISTRAL,
          `Mistral API error ${response.status}: ${errorBody}`,
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
        throw new AIProviderError(AIProvider.MISTRAL, "No completion choices returned", true);
      }

      return {
        content: choice.message.content,
        model: data.model,
        provider: AIProvider.MISTRAL,
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
      log.warn({ err: error }, "Mistral API error");
      throw new AIProviderError(
        AIProvider.MISTRAL,
        error instanceof Error ? error.message : "Mistral request failed",
        true,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async healthCheck(): Promise<AIProviderHealth> {
    if (!this.isConfigured()) {
      return {
        provider: AIProvider.MISTRAL,
        status: "unavailable",
        error: "Not configured",
        checkedAt: new Date(),
      };
    }
    const start = Date.now();
    try {
      await this.complete({ messages: [{ role: "user", content: "Reply ok" }], maxTokens: 5 });
      return {
        provider: AIProvider.MISTRAL,
        status: "available",
        latencyMs: Date.now() - start,
        checkedAt: new Date(),
      };
    } catch {
      return {
        provider: AIProvider.MISTRAL,
        status: "unavailable",
        latencyMs: Date.now() - start,
        error: "Health check failed",
        checkedAt: new Date(),
      };
    }
  }
}
