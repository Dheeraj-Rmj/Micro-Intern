import { z } from 'zod';

/**
 * Prompt Manager — versioned, typed prompt templates.
 *
 * Design: Prompts are code, not data.
 * Storing prompts in the DB enables unreviewed changes. Storing in code means:
 * - Every prompt change goes through PR review
 * - Version history is in git
 * - TypeScript types validate prompt inputs
 * - Easy A/B testing via prompt version parameter
 *
 * Each prompt has:
 * - id: stable identifier (never changes)
 * - version: increment when prompt changes (enables A/B testing)
 * - inputSchema: Zod schema for template variables
 * - systemPrompt: invariant instructions
 * - userPromptTemplate: template with {{variable}} placeholders
 */

export type PromptTemplate<TInput> = {
  id: string;
  version: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  systemPrompt: string;
  userPromptTemplate: string;
};

export type CompiledPrompt = {
  systemMessage: string;
  userMessage: string;
  promptId: string;
  promptVersion: string;
};

/**
 * Compile a prompt template with input variables.
 * Validates input against schema before compilation.
 */
export function compilePrompt<T>(
  template: PromptTemplate<T>,
  input: T,
): CompiledPrompt {
  // Validate input
  const parsed = template.inputSchema.parse(input);

  // Replace {{variable}} placeholders
  let userMessage = template.userPromptTemplate;
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    userMessage = userMessage.replaceAll(`{{${key}}}`, String(value));
  }

  return {
    systemMessage: template.systemPrompt,
    userMessage,
    promptId: template.id,
    promptVersion: template.version,
  };
}

// ── Foundation Prompts ────────────────────────────────────────────────────────
// Feature teams add domain-specific prompts in their respective modules.
// Example structure shown here as reference.

export const PROMPTS = {
  /**
   * General skill trial evaluation prompt.
   * Used by: EvaluationModule
   */
  TRIAL_EVALUATION: {
    id: 'trial-evaluation',
    version: '1.0.0',
    description: 'Evaluate a candidate submission against trial criteria',
    inputSchema: z.object({
      trialTitle: z.string(),
      trialInstructions: z.string(),
      candidateAnswer: z.string(),
      passingScore: z.number(),
      taskTitle: z.string(),
      maxPoints: z.number(),
    }),
    systemPrompt: `You are an expert technical evaluator for a skill trial platform.
Your role is to objectively evaluate candidate submissions against the provided criteria.
You must be fair, consistent, and constructive in your feedback.
Always respond with valid JSON matching the specified output schema.
Never make up information not present in the submission.`,
    userPromptTemplate: `# Trial: {{trialTitle}}

## Task: {{taskTitle}}
**Instructions**: {{trialInstructions}}

## Candidate's Submission:
{{candidateAnswer}}

## Evaluation Criteria:
- Maximum Points: {{maxPoints}}
- Passing Score: {{passingScore}}%

## Required Response Format (JSON):
{
  "earnedPoints": <number 0-{{maxPoints}}>,
  "percentageScore": <number 0-100>,
  "isPassed": <boolean>,
  "summary": "<2-3 sentence objective evaluation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "feedback": "<detailed constructive feedback>"
}`,
  } satisfies PromptTemplate<{
    trialTitle: string;
    trialInstructions: string;
    candidateAnswer: string;
    passingScore: number;
    taskTitle: string;
    maxPoints: number;
  }>,
} as const;
