import { AIProvider } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";
import { AIProviderError } from "../interfaces/IAIProvider.js";

import type {
  IAIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIProviderHealth,
} from "../interfaces/IAIProvider.js";

const log = createModuleLogger("AnthropicProvider");

export class AnthropicProvider implements IAIProvider {
  readonly name = AIProvider.ANTHROPIC;
  readonly defaultModel = "claude-3-5-haiku-latest";
  private readonly baseUrl = "https://api.anthropic.com/v1";
  private readonly apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return this.apiKey !== undefined && this.apiKey.length > 0;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isConfigured()) {
      throw new AIProviderError(AIProvider.ANTHROPIC, "Anthropic API key not configured", false);
    }

    const start = Date.now();

    try {
      // Convert standard OpenAI messages to Anthropic format
      let systemMessage = "";
      const anthropicMessages: { role: string; content: string }[] = [];

      for (const msg of request.messages) {
        if (msg.role === "system") {
          systemMessage += msg.content + "\n";
        } else {
          anthropicMessages.push({ role: msg.role, content: msg.content });
        }
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: request.model ?? this.defaultModel,
          system: systemMessage.trim() || undefined,
          messages: anthropicMessages,
          max_tokens: request.maxTokens ?? 4096,
          temperature: request.temperature ?? 0.1,
          top_p: request.topP ?? 1,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const isRateLimited = response.status === 429;
        throw new AIProviderError(
          AIProvider.ANTHROPIC,
          `Anthropic API error ${response.status}: ${errorBody}`,
          isRateLimited,
        );
      }

      const data = (await response.json()) as {
        content: Array<{ text: string }>;
        model: string;
        usage: { input_tokens: number; output_tokens: number };
        stop_reason: string;
      };

      const choice = data.content[0];
      if (choice === undefined) {
        throw new AIProviderError(AIProvider.ANTHROPIC, "No completion choices returned", true);
      }

      return {
        content: choice.text,
        model: data.model,
        provider: AIProvider.ANTHROPIC,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
        latencyMs: Date.now() - start,
        finishReason: data.stop_reason === "end_turn" ? "stop" : "length",
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      log.warn({ err: error }, "Anthropic API error");
      throw new AIProviderError(
        AIProvider.ANTHROPIC,
        error instanceof Error ? error.message : "Anthropic request failed",
        true,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async healthCheck(): Promise<AIProviderHealth> {
    if (!this.isConfigured()) {
      return {
        provider: AIProvider.ANTHROPIC,
        status: "unavailable",
        error: "Not configured",
        checkedAt: new Date(),
      };
    }
    const start = Date.now();
    try {
      await this.complete({ messages: [{ role: "user", content: "Reply ok" }], maxTokens: 5 });
      return {
        provider: AIProvider.ANTHROPIC,
        status: "available",
        latencyMs: Date.now() - start,
        checkedAt: new Date(),
      };
    } catch {
      return {
        provider: AIProvider.ANTHROPIC,
        status: "unavailable",
        latencyMs: Date.now() - start,
        error: "Health check failed",
        checkedAt: new Date(),
      };
    }
  }
}
