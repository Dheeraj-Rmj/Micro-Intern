import { createModuleLogger } from "@/core/logger.js";
import { compilePrompt, PROMPTS } from "@/infrastructure/ai/PromptManager.js";
import type { PrismaClient, Prisma, QuestionBank } from "@microintern/database";
import type { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";

const log = createModuleLogger("QuestionBankService");

export type CreateQuestionDTO = {
  companyId: string;
  question: string;
  type: string;
  difficulty: string;
  skills?: string[];
  competencies?: string[];
  options?: Array<{ text: string; isCorrect: boolean }>;
  explanation?: string;
};

export type GenerateQuestionsDTO = {
  companyId: string;
  skills: string[];
  competencies: string[];
  questionType: string;
  difficulty: string;
  count: number;
};

export class QuestionBankService {
  constructor(
    private readonly db: PrismaClient,
    private readonly aiEngine: AIFallbackEngine,
  ) {}

  async createQuestion(dto: CreateQuestionDTO) {
    return this.db.questionBank.create({
      data: {
        companyId: dto.companyId,
        question: dto.question,
        type: dto.type,
        difficulty: dto.difficulty,
        skills: dto.skills ?? [],
        competencies: dto.competencies ?? [],
        options: dto.options ?? undefined,
        explanation: dto.explanation,
      },
    });
  }

  async listQuestions(
    companyId: string,
    filters?: { difficulty?: string; type?: string; skill?: string },
  ) {
    return this.db.questionBank.findMany({
      where: {
        companyId,
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.skill && { skills: { has: filters.skill } }),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteQuestion(questionId: string) {
    return this.db.questionBank.delete({ where: { id: questionId } });
  }

  async generateQuestions(dto: GenerateQuestionsDTO) {
    log.info({ companyId: dto.companyId, count: dto.count }, "Generating AI questions");

    const { systemMessage, userMessage } = compilePrompt(PROMPTS.QUESTION_GENERATOR, {
      skills: dto.skills.join(", "),
      competencies: dto.competencies.join(", "),
      questionType: dto.questionType,
      difficulty: dto.difficulty,
      count: dto.count,
    });

    const aiResponse = await this.aiEngine.complete({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      responseFormat: { type: "json_object" } as const,
      temperature: 0.7,
    });

    let generated: any[] = [];
    try {
      const parsed = JSON.parse(aiResponse.content);
      generated = Array.isArray(parsed) ? parsed : (parsed.questions ?? []);
    } catch {
      log.warn("Failed to parse AI question generation response");
      return [];
    }

    // Persist generated questions to the bank
    const created = await Promise.all(
      generated.map((q: any) =>
        this.db.questionBank.create({
          data: {
            companyId: dto.companyId,
            question: q.question,
            type: q.type ?? dto.questionType,
            difficulty: q.difficulty ?? dto.difficulty,
            skills: q.skills ?? dto.skills,
            competencies: q.competencies ?? dto.competencies,
            options: q.options ?? undefined,
            explanation: q.explanation,
          },
        }),
      ),
    );

    log.info({ companyId: dto.companyId, generated: created.length }, "Questions saved to bank");
    return created;
  }

  async incrementUsage(questionId: string) {
    return this.db.questionBank.update({
      where: { id: questionId },
      data: { timesUsed: { increment: 1 } },
    });
  }
}
