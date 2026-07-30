import { z } from "zod";
import { PrismaClient } from "@microintern/database";
import { createModuleLogger } from "@/core/logger.js";
import { PROMPTS, compilePrompt } from "@/infrastructure/ai/PromptManager.js";
import { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";

const log = createModuleLogger("AnalyzeSubmissionIntegrityUseCase");

const OutputSchema = z.object({
  integrityScore: z.number().min(0).max(100),
  isSuspicious: z.boolean(),
  flags: z.array(z.string()),
  reasoning: z.string(),
});

export type IntegrityAnalysisResult = z.infer<typeof OutputSchema>;

export class AnalyzeSubmissionIntegrityUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly aiEngine: AIFallbackEngine,
  ) {}

  public async execute(submissionId: string): Promise<IntegrityAnalysisResult> {
    log.info({ submissionId }, "Analyzing submission integrity...");

    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        answers: true,
        assessment: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!submission) {
      throw new Error(`Submission not found: ${submissionId}`);
    }

    // Prepare context
    const taskContext = submission.assessment.tasks.map((t: any) => t.content).join("\\n---\\n");
    const candidateSubmission = submission.answers.map((a: any) => a.content).join("\\n---\\n");

    // In a real scenario, this would be computed from frontend telemetry
    const timeTakenMs =
      (submission.submittedAt?.getTime() ?? Date.now()) -
      (submission.startedAt?.getTime() ?? Date.now());
    const minutesTaken = timeTakenMs / 1000 / 60;

    const metadata = `Time Taken: ${minutesTaken.toFixed(2)} minutes. Paste Events: Unknown.`;

    const { systemMessage, userMessage } = compilePrompt(PROMPTS.INTEGRITY_ANALYZER, {
      taskContext,
      candidateSubmission,
      metadata,
    });

    try {
      const response = await this.aiEngine.complete({
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        responseFormat: { type: "json_object" },
      });

      const responseText = response.content;
      const parsed = JSON.parse(responseText);
      const validated = OutputSchema.parse(parsed);

      // Save to database
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          integrityScore: validated.integrityScore,
          integrityFlags: validated.flags,
          isSuspicious: validated.isSuspicious,
        },
      });

      log.info(
        { submissionId, score: validated.integrityScore, suspicious: validated.isSuspicious },
        "Integrity analysis complete",
      );
      return validated;
    } catch (error) {
      log.error({ err: error, submissionId }, "Failed to analyze submission integrity");
      throw error;
    }
  }
}
