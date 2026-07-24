import { AIProvider } from '@microintern/shared';

import type { IAIProvider, AICompletionRequest, AICompletionResponse, AIProviderHealth } from '../interfaces/IAIProvider.js';
import { AIProviderError } from '../interfaces/IAIProvider.js';
import { config } from '@/core/config.js';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('OllamaProvider');

/**
 * Ollama Provider — local inference fallback.
 *
 * Ollama runs open-source models locally — zero API cost, works offline.
 * Used as the final fallback when all cloud providers fail.
 * Also useful for development when no API keys are available.
 *
 * Setup: Install Ollama and run `ollama pull llama3.2`
 */
export class OllamaProvider implements IAIProvider {
  readonly name = AIProvider.OLLAMA;
  readonly defaultModel = config.OLLAMA_DEFAULT_MODEL;
  private readonly baseUrl = config.OLLAMA_BASE_URL;

  isConfigured(): boolean {
    return this.baseUrl !== undefined && this.baseUrl.length > 0;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const start = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model ?? this.defaultModel,
          messages: request.messages,
          stream: false,
          options: {
            num_predict: request.maxTokens ?? 8192,
            temperature: request.temperature ?? 0.1,
            top_p: request.topP ?? 1,
          },
          format: request.responseFormat?.type === 'json_object' ? 'json' : undefined,
        }),
        signal: AbortSignal.timeout(60_000), // Ollama is slower
      });

      if (!response.ok) {
        throw new AIProviderError(
          AIProvider.OLLAMA,
          `Ollama error ${response.status}: ${await response.text()}`,
          false,
        );
      }

      const data = await response.json() as {
        message: { content: string };
        done: boolean;
        prompt_eval_count?: number;
        eval_count?: number;
        model: string;
      };

      return {
        content: data.message.content,
        model: data.model,
        provider: AIProvider.OLLAMA,
        usage: {
          promptTokens: data.prompt_eval_count ?? 0,
          completionTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
        },
        latencyMs: Date.now() - start,
        finishReason: 'stop',
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      log.warn({ err: error }, 'Ollama error');
      throw new AIProviderError(
        AIProvider.OLLAMA,
        error instanceof Error ? error.message : 'Ollama request failed',
        false, // Ollama failures are usually not retryable (service down)
        error instanceof Error ? error : undefined,
      );
    }
  }

  async healthCheck(): Promise<AIProviderHealth> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        return { provider: AIProvider.OLLAMA, status: 'available', latencyMs: Date.now() - start, checkedAt: new Date() };
      }
      return { provider: AIProvider.OLLAMA, status: 'unavailable', latencyMs: Date.now() - start, error: 'Ollama not running', checkedAt: new Date() };
    } catch {
      return { provider: AIProvider.OLLAMA, status: 'unavailable', latencyMs: Date.now() - start, error: 'Ollama not reachable', checkedAt: new Date() };
    }
  }
}
