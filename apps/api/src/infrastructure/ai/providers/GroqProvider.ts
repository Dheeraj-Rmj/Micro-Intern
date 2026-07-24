import Groq from 'groq-sdk';
import { AIProvider } from '@microintern/shared';

import type { IAIProvider, AICompletionRequest, AICompletionResponse, AIProviderHealth } from '../interfaces/IAIProvider.js';
import { AIProviderError } from '../interfaces/IAIProvider.js';
import { config } from '@/core/config.js';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('GroqProvider');

/**
 * Groq AI Provider — primary inference provider.
 *
 * Groq uses GroqCloud LPU (Language Processing Unit) for ultra-fast inference.
 * Latency: typically 100-300ms vs 1-3s for GPU-based providers.
 * Free tier: generous for development and testing.
 */
export class GroqProvider implements IAIProvider {
  readonly name = AIProvider.GROQ;
  readonly defaultModel = config.GROQ_DEFAULT_MODEL;

  private readonly client: Groq | null;

  constructor() {
    if (config.GROQ_API_KEY !== undefined && config.GROQ_API_KEY.length > 0) {
      this.client = new Groq({
        apiKey: config.GROQ_API_KEY,
        timeout: config.GROQ_TIMEOUT_MS,
        maxRetries: 0, // Retries handled by the fallback engine
      });
    } else {
      this.client = null;
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (this.client === null) {
      throw new AIProviderError(AIProvider.GROQ, 'Groq API key not configured', false);
    }

    const start = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: request.model ?? this.defaultModel,
        messages: request.messages,
        max_tokens: request.maxTokens ?? config.GROQ_MAX_TOKENS,
        temperature: request.temperature ?? 0.1,
        top_p: request.topP ?? 1,
        response_format: request.responseFormat,
        stream: false,
      });

      const choice = response.choices[0];
      if (choice === undefined) {
        throw new AIProviderError(AIProvider.GROQ, 'No completion choices returned', true);
      }

      return {
        content: choice.message.content ?? '',
        model: response.model,
        provider: AIProvider.GROQ,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        latencyMs: Date.now() - start,
        finishReason: (choice.finish_reason as AICompletionResponse['finishReason']) ?? 'stop',
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;

      const isRateLimit = error instanceof Groq.RateLimitError;
      const isTimeout = error instanceof Groq.APIConnectionTimeoutError;

      log.warn(
        { err: error, provider: AIProvider.GROQ, isRateLimit, isTimeout },
        'Groq API error',
      );

      throw new AIProviderError(
        AIProvider.GROQ,
        error instanceof Error ? error.message : 'Groq request failed',
        true, // All Groq errors are retryable (will fallback)
        error instanceof Error ? error : undefined,
      );
    }
  }

  async healthCheck(): Promise<AIProviderHealth> {
    const start = Date.now();
    if (!this.isConfigured()) {
      return {
        provider: AIProvider.GROQ,
        status: 'unavailable',
        error: 'Not configured',
        checkedAt: new Date(),
      };
    }

    try {
      await this.complete({
        messages: [{ role: 'user', content: 'Reply with just the word "ok"' }],
        maxTokens: 5,
      });
      return {
        provider: AIProvider.GROQ,
        status: 'available',
        latencyMs: Date.now() - start,
        checkedAt: new Date(),
      };
    } catch {
      return {
        provider: AIProvider.GROQ,
        status: 'unavailable',
        latencyMs: Date.now() - start,
        error: 'Health check failed',
        checkedAt: new Date(),
      };
    }
  }
}
