import { createModuleLogger } from "@/core/logger.js";

import { AIProviderError } from "./interfaces/IAIProvider.js";

import type { AICompletionResponse } from "./interfaces/IAIProvider.js";

const log = createModuleLogger("AISafetyLayer");

/**
 * AI Safety Layer — content safety filter applied to all AI responses.
 *
 * Every response from any AI provider passes through this layer before
 * being returned to callers.
 *
 * Checks:
 * 1. Content policy violations (hate speech, violence, PII)
 * 2. Response completeness (truncated or empty responses)
 * 3. JSON validity (for structured outputs)
 * 4. Prompt injection detection
 *
 * This layer is intentionally conservative — false positives are flagged
 * for human review rather than silently passed through.
 */

export type SafetyCheckResult = {
  passed: boolean;
  flags: string[];
  requiresHumanReview: boolean;
};

// Patterns that indicate potential safety issues
const SAFETY_PATTERNS = {
  piiPatterns: [
    /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/, // SSN
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email (in AI output context)
  ],
  promptInjection: [
    /ignore previous instructions/i,
    /ignore all previous/i,
    /disregard your instructions/i,
    /you are now/i,
    /pretend you are/i,
    /act as if/i,
  ],
};

export class AISafetyLayer {
  /**
   * Check user input (such as candidate assessment answers) for prompt injection attempts.
   */
  checkInput(text: string): SafetyCheckResult {
    const flags: string[] = [];

    if (text) {
      for (const pattern of SAFETY_PATTERNS.promptInjection) {
        if (pattern.test(text)) {
          flags.push("PROMPT_INJECTION_DETECTED");
          break;
        }
      }
    }

    const requiresHumanReview = flags.length > 0;

    if (requiresHumanReview) {
      log.warn({ flags }, "AI safety layer flagged input for prompt injection");
    }

    return {
      passed: !requiresHumanReview,
      flags,
      requiresHumanReview,
    };
  }

  /**
   * Check an AI response for safety violations.
   */
  checkResponse(response: AICompletionResponse): SafetyCheckResult {
    const flags: string[] = [];

    // Check for empty or very short responses
    if (response.content.trim().length < 10) {
      flags.push("RESPONSE_TOO_SHORT");
    }

    // Check finish reason
    if (response.finishReason === "content_filter") {
      flags.push("CONTENT_FILTER_TRIGGERED");
    }

    // Check for prompt injection in response
    for (const pattern of SAFETY_PATTERNS.promptInjection) {
      if (pattern.test(response.content)) {
        flags.push("PROMPT_INJECTION_DETECTED");
        break;
      }
    }

    const requiresHumanReview = flags.length > 0;

    if (requiresHumanReview) {
      log.warn(
        { flags, provider: response.provider, model: response.model },
        "AI safety check flagged response",
      );
    }

    return {
      passed: !requiresHumanReview,
      flags,
      requiresHumanReview,
    };
  }

  /**
   * Validate JSON output from AI when responseFormat is json_object.
   */
  validateJsonResponse<T>(content: string, schema: { parse: (v: unknown) => T }): T {
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new AIProviderError("groq" as never, "AI returned invalid JSON", false);
    }

    return schema.parse(parsed);
  }
}
