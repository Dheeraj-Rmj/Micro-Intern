import { AIFallbackEngine } from './AIFallbackEngine.js';
import { AISafetyLayer } from './AISafetyLayer.js';
import { GroqProvider } from './providers/GroqProvider.js';
import { OpenRouterProvider } from './providers/OpenRouterProvider.js';
import { GeminiProvider } from './providers/GeminiProvider.js';
import { OllamaProvider } from './providers/OllamaProvider.js';
import { config, aiFallbackProviders } from '@/core/config.js';
import type { IAIProvider } from './interfaces/IAIProvider.js';
import type { AIProvider } from '@microintern/shared';

export { AIFallbackEngine } from './AIFallbackEngine.js';
export { AISafetyLayer } from './AISafetyLayer.js';
export { compilePrompt, PROMPTS } from './PromptManager.js';
export type { CompiledPrompt, PromptTemplate } from './PromptManager.js';
export type { IAIProvider, AICompletionRequest, AICompletionResponse } from './interfaces/IAIProvider.js';

/**
 * AI Gateway singleton factory.
 * Creates the fallback engine with providers in configured priority order.
 */
let gatewayInstance: AIFallbackEngine | null = null;
let safetyInstance: AISafetyLayer | null = null;

const providerMap: Record<string, () => IAIProvider> = {
  groq: () => new GroqProvider(),
  openrouter: () => new OpenRouterProvider(),
  gemini: () => new GeminiProvider(),
  ollama: () => new OllamaProvider(),
};

export function createAIGateway(): AIFallbackEngine {
  if (gatewayInstance !== null) return gatewayInstance;

  // Build provider list: primary first, then fallbacks
  const providerOrder = [config.AI_PRIMARY_PROVIDER, ...aiFallbackProviders];
  const seen = new Set<string>();
  const providers: IAIProvider[] = [];

  for (const providerName of providerOrder) {
    if (seen.has(providerName)) continue;
    seen.add(providerName);
    const factory = providerMap[providerName];
    if (factory !== undefined) {
      providers.push(factory());
    }
  }

  gatewayInstance = new AIFallbackEngine(providers);
  return gatewayInstance;
}

export function getAIGateway(): AIFallbackEngine {
  if (gatewayInstance === null) {
    return createAIGateway();
  }
  return gatewayInstance;
}

export function getAISafetyLayer(): AISafetyLayer {
  if (safetyInstance === null) {
    safetyInstance = new AISafetyLayer();
  }
  return safetyInstance;
}
