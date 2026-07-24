import { GoogleGenerativeAI, type GenerationConfig } from '@google/generative-ai';
import { AIProvider } from '@microintern/shared';

import type { IAIProvider, AICompletionRequest, AICompletionResponse, AIProviderHealth } from '../interfaces/IAIProvider.js';
import { AIProviderError } from '../interfaces/IAIProvider.js';
import { config } from '@/core/config.js';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('GeminiProvider');

/**
 * Google Gemini Provider — third fallback.
 * Free tier available via AI Studio.
 */
export class GeminiProvider implements IAIProvider {
  readonly name = AIProvider.GEMINI;
  readonly defaultModel = config.GEMINI_DEFAULT_MODEL;

  private readonly client: GoogleGenerativeAI | null;

  constructor() {
    this.client = config.GEMINI_API_KEY !== undefined && config.GEMINI_API_KEY.length > 0
      ? new GoogleGenerativeAI(config.GEMINI_API_KEY)
      : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (this.client === null) {
      throw new AIProviderError(AIProvider.GEMINI, 'Gemini API key not configured', false);
    }

    const start = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: request.model ?? this.defaultModel,
      });

      const generationConfig: GenerationConfig = {
        maxOutputTokens: request.maxTokens ?? 8192,
        temperature: request.temperature ?? 0.1,
        topP: request.topP ?? 1,
        ...(request.responseFormat?.type === 'json_object' && {
          responseMimeType: 'application/json',
        }),
      };

      // Convert OpenAI-style messages to Gemini format
      const systemMessage = request.messages.find((m) => m.role === 'system');
      const chatMessages = request.messages.filter((m) => m.role !== 'system');
      const lastMessage = chatMessages[chatMessages.length - 1];

      if (lastMessage === undefined) {
        throw new AIProviderError(AIProvider.GEMINI, 'No user message provided', false);
      }

      const chat = model.startChat({
        generationConfig,
        systemInstruction: systemMessage?.content,
        history: chatMessages.slice(0, -1).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      });

      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      const content = response.text();

      return {
        content,
        model: request.model ?? this.defaultModel,
        provider: AIProvider.GEMINI,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
        },
        latencyMs: Date.now() - start,
        finishReason: 'stop',
      };
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      log.warn({ err: error }, 'Gemini API error');
      throw new AIProviderError(
        AIProvider.GEMINI,
        error instanceof Error ? error.message : 'Gemini request failed',
        true,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async healthCheck(): Promise<AIProviderHealth> {
    if (!this.isConfigured()) {
      return { provider: AIProvider.GEMINI, status: 'unavailable', error: 'Not configured', checkedAt: new Date() };
    }
    const start = Date.now();
    try {
      await this.complete({ messages: [{ role: 'user', content: 'Reply ok' }], maxTokens: 5 });
      return { provider: AIProvider.GEMINI, status: 'available', latencyMs: Date.now() - start, checkedAt: new Date() };
    } catch {
      return { provider: AIProvider.GEMINI, status: 'unavailable', latencyMs: Date.now() - start, error: 'Health check failed', checkedAt: new Date() };
    }
  }
}
