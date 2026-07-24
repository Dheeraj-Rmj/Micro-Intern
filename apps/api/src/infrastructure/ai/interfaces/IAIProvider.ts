import type { AIProvider } from '@microintern/shared';

/**
 * AI Provider Interface — the contract all AI providers must implement.
 *
 * Design: Provider-agnostic interface enables:
 * - Transparent fallback between providers
 * - Easy addition of new providers
 * - Testability with mock providers
 * - A/B testing between providers
 */

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AICompletionRequest = {
  messages: AIMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: false; // Streaming handled separately
  responseFormat?: { type: 'json_object' | 'text' };
};

export type AICompletionResponse = {
  content: string;
  model: string;
  provider: AIProvider;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
};

export type AIProviderHealth = {
  provider: AIProvider;
  status: 'available' | 'degraded' | 'unavailable';
  latencyMs?: number;
  error?: string;
  checkedAt: Date;
};

/**
 * Core interface all AI providers must implement.
 */
export interface IAIProvider {
  readonly name: AIProvider;
  readonly defaultModel: string;

  /**
   * Generate a chat completion.
   * @throws {AIProviderError} When the provider fails
   */
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;

  /**
   * Check provider availability and latency.
   */
  healthCheck(): Promise<AIProviderHealth>;

  /**
   * Whether this provider is currently configured (API key present).
   */
  isConfigured(): boolean;
}

/**
 * AI provider-specific error — carries provider identity for fallback logic.
 */
export class AIProviderError extends Error {
  constructor(
    public readonly provider: AIProvider,
    message: string,
    public readonly isRetryable: boolean = true,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = 'AIProviderError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
