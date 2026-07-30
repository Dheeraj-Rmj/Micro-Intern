import { createModuleLogger } from '@/core/logger.js';
import { compilePrompt, PROMPTS } from '@/infrastructure/ai/PromptManager.js';
import type { PrismaClient, Prisma, InterviewSession, InterviewAnswer } from '@microintern/database';
import type { AIFallbackEngine } from '@/infrastructure/ai/AIFallbackEngine.js';

const log = createModuleLogger('InterviewService');

export type CreateInterviewDTO = {
  companyId: string;
  roleProfileId?: string;
  title: string;
  description?: string;
  timeLimitMins?: number;
  passingScore?: number;
  questions: Array<{
    text: string;
    category?: string;
    difficulty?: string;
    maxPoints?: number;
    rubric?: string;
  }>;
};

export type SubmitAnswerDTO = {
  sessionId: string;
  questionId: string;
  answerText: string;
};

export class InterviewService {
  constructor(
    private readonly db: PrismaClient,
    private readonly aiEngine: AIFallbackEngine,
  ) {}

  async createInterview(dto: CreateInterviewDTO) {
    log.info({ companyId: dto.companyId }, 'Creating interview');
    return this.db.interview.create({
      data: {
        companyId: dto.companyId,
        roleProfileId: dto.roleProfileId,
        title: dto.title,
        description: dto.description,
        timeLimitMins: dto.timeLimitMins,
        passingScore: dto.passingScore ?? 70,
        questions: {
          create: dto.questions.map((q, idx) => ({
            text: q.text,
            category: q.category,
            difficulty: q.difficulty,
            maxPoints: q.maxPoints ?? 10,
            rubric: q.rubric,
            sortOrder: idx,
          })),
        },
      },
      include: { questions: true },
    });
  }

  async publishInterview(interviewId: string) {
    return this.db.interview.update({
      where: { id: interviewId },
      data: { status: 'PUBLISHED' },
    });
  }

  async getInterview(interviewId: string) {
    return this.db.interview.findUniqueOrThrow({
      where: { id: interviewId },
      include: { questions: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async listCompanyInterviews(companyId: string) {
    return this.db.interview.findMany({
      where: { companyId },
      include: { _count: { select: { sessions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async inviteCandidate(interviewId: string, candidateId: string, journeyId?: string) {
    const interview = await this.db.interview.findUniqueOrThrow({ where: { id: interviewId } });
    if (interview.status !== 'PUBLISHED') {
      throw new Error('Interview must be published before inviting candidates');
    }
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    return this.db.interviewSession.create({
      data: { interviewId, candidateId, journeyId, expiresAt },
    });
  }

  async startSession(sessionId: string) {
    return this.db.interviewSession.update({
      where: { id: sessionId },
      data: { status: 'STARTED', startedAt: new Date() },
      include: {
        interview: { include: { questions: { orderBy: { sortOrder: 'asc' } } } },
      },
    });
  }

  async submitAnswer(dto: SubmitAnswerDTO) {
    return this.db.interviewAnswer.upsert({
      where: { sessionId_questionId: { sessionId: dto.sessionId, questionId: dto.questionId } },
      update: { answerText: dto.answerText },
      create: {
        sessionId: dto.sessionId,
        questionId: dto.questionId,
        answerText: dto.answerText,
      },
    });
  }

  async submitSession(sessionId: string) {
    const session = await this.db.interviewSession.update({
      where: { id: sessionId },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
    // Trigger async AI evaluation (fire and forget with logging)
    this.evaluateSession(sessionId).catch((err) =>
      log.error({ err, sessionId }, 'Async session evaluation failed'),
    );
    return session;
  }

  async evaluateSession(sessionId: string) {
    log.info({ sessionId }, 'Evaluating interview session via AI');
    const session = await this.db.interviewSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: {
        interview: { include: { questions: true } },
        answers: true,
      },
    });

    let totalScore = 0;
    let maxScore = 0;
    const questionResults: Array<{
      questionId: string;
      question: string;
      answer: string;
      score: number;
      maxPoints: number;
      feedback: string;
    }> = [];

    for (const question of session.interview.questions) {
      maxScore += question.maxPoints;
      const answer = session.answers.find((a) => a.questionId === question.id);
      if (!answer) {
        questionResults.push({
          questionId: question.id,
          question: question.text,
          answer: 'No answer provided',
          score: 0,
          maxPoints: question.maxPoints,
          feedback: 'No answer was provided for this question.',
        });
        continue;
      }

      const { systemMessage, userMessage } = compilePrompt(PROMPTS.INTERVIEW_ANSWER_EVALUATOR, {
        questionText: question.text,
        rubric: question.rubric ?? 'Evaluate based on clarity, accuracy, and depth.',
        answerText: answer.answerText,
        maxPoints: question.maxPoints,
      });

      let scoreResult = { score: 0, feedback: 'Unable to evaluate.' };
      try {
        const aiResponse = await this.aiEngine.complete({
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage },
          ],
          responseFormat: { type: 'json_object' } as const,
          temperature: 0.2,
        });
        scoreResult = JSON.parse(aiResponse.content) as { score: number; feedback: string };
      } catch {
        log.warn({ questionId: question.id }, 'AI evaluation failed for question');
      }

      const clampedScore = Math.min(scoreResult.score, question.maxPoints);
      totalScore += clampedScore;

      await this.db.interviewAnswer.update({
        where: { sessionId_questionId: { sessionId, questionId: question.id } },
        data: { score: clampedScore, aiFeedback: scoreResult.feedback },
      });

      questionResults.push({
        questionId: question.id,
        question: question.text,
        answer: answer.answerText,
        score: clampedScore,
        maxPoints: question.maxPoints,
        feedback: scoreResult.feedback,
      });
    }

    const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const isPassed = percentageScore >= session.interview.passingScore;
    const aiReport = {
      totalScore,
      maxScore,
      percentageScore: Math.round(percentageScore * 10) / 10,
      isPassed,
      recommendation: isPassed ? 'PROCEED' : 'REJECT',
      questionResults,
    };

    return this.db.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'EVALUATED',
        totalScore: percentageScore,
        isPassed,
        aiReport,
      },
    });
  }

  async getSession(sessionId: string) {
    return this.db.interviewSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: {
        interview: { include: { questions: { orderBy: { sortOrder: 'asc' } } } },
        answers: true,
      },
    });
  }

  async listCandidateSessions(candidateId: string) {
    return this.db.interviewSession.findMany({
      where: { candidateId },
      include: { interview: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSessionReport(sessionId: string) {
    return this.db.interviewSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: {
        interview: true,
        answers: { include: { question: true } },
      },
    });
  }
}
