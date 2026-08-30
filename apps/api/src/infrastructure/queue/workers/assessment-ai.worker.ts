import { QUEUE_NAMES, AI } from "@microintern/shared";
import { prisma } from "@/core/database.js";
import { createModuleLogger } from "@/core/logger.js";
import { CompanyAIGatewayFactory } from "@/infrastructure/ai/CompanyAIGatewayFactory.js";

import { createWorker, type AssessmentAIJobData } from "../queues.js";
import type { Job } from "bullmq";

const log = createModuleLogger("AssessmentAIWorker");

export function startAssessmentAIWorker() {
  const worker = createWorker<AssessmentAIJobData>(
    QUEUE_NAMES.ASSESSMENT_AI,
    async (job: Job<AssessmentAIJobData>) => {
      const { assessmentId, recruiterId, action, input } = job.data;
      log.info({ jobId: job.id, assessmentId, action }, "Processing Assessment AI Assistant job");

      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        select: { companyId: true },
      });

      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`);
      }

      const aiGateway = await CompanyAIGatewayFactory.getGatewayForCompany(assessment.companyId);

      // 1. Build prompt for requested action
      const promptMessages = buildPromptForAction(action, input);

      // 2. Call AI Gateway with fallback & retry protection
      const response = await aiGateway.complete({
        messages: promptMessages,
        temperature: AI.GENERATION_TEMPERATURE,
        maxTokens: 4096,
        responseFormat: { type: "json_object" },
      });

      let parsedOutput: Record<string, any>;
      try {
        parsedOutput = JSON.parse(response.content);
      } catch {
        throw new Error("AI returned invalid JSON formatting");
      }

      // 3. Record AI Metadata in DB
      await prisma.assessmentAIMetadata.create({
        data: {
          assessmentId,
          provider: response.provider,
          model: response.model,
          promptVersion: "1.0.0",
          temperature: AI.GENERATION_TEMPERATURE,
          inputTokens: response.usage.promptTokens,
          outputTokens: response.usage.completionTokens,
          generationTimeMs: response.latencyMs,
        },
      });

      // 4. Update Assessment aggregate or create Version snapshot
      await handleActionOutput(prisma, assessmentId, recruiterId, action, parsedOutput);

      log.info({ jobId: job.id, assessmentId, action }, "Assessment AI job completed successfully");
    },
    {
      concurrency: 2, // Limit concurrent AI generation calls
    },
  );

  worker.on("failed", (job, err) => {
    log.error({ jobId: job?.id, error: err.message }, "Assessment AI worker job failed");
  });

  return worker;
}

function buildPromptForAction(
  action: AssessmentAIJobData["action"],
  input: Record<string, unknown>,
): Array<{ role: "system" | "user"; content: string }> {
  const systemPrompt = `You are an enterprise Lead Technical Recruiter and Principal Architect at MicroIntern.
You create high-quality, competency-based real-world work assessments for hiring software engineers, designers, and product teams.
Always respond with valid JSON matching the requested schema.`;

  const inp = input as any;
  const userPromptMap: Record<AssessmentAIJobData["action"], string> = {
    GENERATE_ASSESSMENT: `Generate a complete competency-based work assessment for the role: "${String(inp.roleTitle || "Software Engineer")}".
Difficulty: "${String(inp.difficulty || "SENIOR")}".
Return JSON object:
{
  "title": "string",
  "description": "string (markdown)",
  "instructions": "string (detailed markdown instructions)",
  "skillsRequired": ["string"],
  "durationMinutes": 120,
  "passingScore": 75,
  "complexityScore": 75,
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "maxPoints": 50,
      "taskType": "CODING",
      "expectedOutput": "string",
      "evaluationNotes": "string"
    }
  ]
}`,
    IMPROVE_ASSESSMENT: `Improve and polish the following assessment description and instructions: "${JSON.stringify(input)}".
Return JSON object: { "description": "string (markdown)", "instructions": "string (markdown)" }`,
    REWRITE_INSTRUCTIONS: `Rewrite these instructions in an award-winning, Notion/Linear style markdown format: "${String(inp.instructions || "")}".
Return JSON object: { "instructions": "string" }`,
    GENERATE_RUBRIC: `Generate a granular evaluation rubric for assessment: "${String(inp.title || "")}".
Return JSON object:
{
  "tasks": [
    {
      "title": "string",
      "maxPoints": 100,
      "criteria": [
        { "title": "string", "description": "string", "weight": 0.5, "maxPoints": 50 }
      ]
    }
  ]
}`,
    SUGGEST_SKILLS: `Suggest 5-10 relevant technical skills for role: "${String(inp.roleTitle || "")}".
Return JSON object: { "skills": ["string"] }`,
    SUGGEST_DELIVERABLES: `Suggest required deliverables for role: "${String(inp.roleTitle || "")}".
Return JSON object: { "deliverables": [{ "title": "string", "deliverableType": "GITHUB_REPO", "isRequired": true }] }`,
    ESTIMATE_DIFFICULTY: `Estimate difficulty level and complexity score (1-100) for assessment: "${String(inp.title || "")}".
Return JSON object: { "difficulty": "SENIOR", "complexityScore": 80 }`,
    ESTIMATE_DURATION: `Estimate completion time in minutes for assessment: "${String(inp.title || "")}".
Return JSON object: { "durationMinutes": 120 }`,
    SUGGEST_LEARNING_OUTCOMES: `Suggest candidate learning outcomes for assessment: "${String(inp.title || "")}".
Return JSON object: { "learningOutcomes": ["string"] }`,
    GENERATE_INTERVIEW_QUESTIONS: `Generate follow-up technical interview questions based on assessment: "${String(inp.title || "")}".
Return JSON object: { "questions": ["string"] }`,
    GENERATE_EVALUATION_NOTES: `Generate recruiter evaluation notes and red flags for assessment: "${String(inp.title || "")}".
Return JSON object: { "evaluationNotes": "string" }`,
  };

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPromptMap[action] || "Return JSON: {}" },
  ];
}

async function handleActionOutput(
  db: any,
  assessmentId: string,
  recruiterId: string,
  action: AssessmentAIJobData["action"],
  parsed: Record<string, any>,
) {
  const p = parsed as any;
  if (action === "GENERATE_ASSESSMENT") {
    await db.assessment.update({
      where: { id: assessmentId },
      data: {
        title: p.title,
        description: p.description,
        instructions: p.instructions,
        skillsRequired: p.skillsRequired || [],
        durationMinutes: p.durationMinutes || 120,
        passingScore: p.passingScore || 70,
        complexityScore: p.complexityScore || 75,
      },
    });
  } else if (action === "IMPROVE_ASSESSMENT" || action === "REWRITE_INSTRUCTIONS") {
    await db.assessment.update({
      where: { id: assessmentId },
      data: {
        ...(p.description ? { description: p.description } : {}),
        ...(p.instructions ? { instructions: p.instructions } : {}),
      },
    });
  } else if (action === "SUGGEST_SKILLS") {
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      select: { skillsRequired: true },
    });
    const existing = assessment?.skillsRequired || [];
    const merged = Array.from(new Set([...existing, ...(p.skills || [])]));
    await db.assessment.update({
      where: { id: assessmentId },
      data: { skillsRequired: merged },
    });
  }

  const updatedAssessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    include: { tasks: true, deliverables: true, sections: true },
  });

  if (updatedAssessment) {
    const versionCount = await db.assessmentVersion.count({ where: { assessmentId } });
    await db.assessmentVersion.create({
      data: {
        assessmentId,
        versionNumber: versionCount + 1,
        snapshot: updatedAssessment as any,
        changeSummary: `AI Assistant (${action}) executed by recruiter`,
        createdBy: recruiterId,
      },
    });
  }
}
