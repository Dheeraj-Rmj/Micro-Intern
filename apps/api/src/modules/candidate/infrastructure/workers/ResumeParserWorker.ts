import { Worker } from "bullmq";
import { QUEUE_NAMES } from "@microintern/shared";
import { ResumeStatus } from "@microintern/database";
import { createWorker, type ResumeParserJobData } from "@/infrastructure/queue/queues.js";
import { getAIGateway } from "@/infrastructure/ai/index.js";
import { prisma } from "@/core/database.js";
import { logger } from "@/core/logger.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

let workerInstance: Worker<ResumeParserJobData> | null = null;

export function initResumeParserWorker(): Worker<ResumeParserJobData> {
  if (workerInstance) return workerInstance;

  workerInstance = createWorker<ResumeParserJobData>(
    QUEUE_NAMES.RESUME_PARSER,
    async (job) => {
      const { candidateId, fileText } = job.data;
      if (!fileText) {
        logger.warn({ candidateId }, "No resume text provided for parsing");
        return;
      }

      logger.info({ candidateId }, "Parsing resume via AI");

      // Update status to pending
      await prisma.candidateProfile.update({
        where: { id: candidateId },
        data: { resumeStatus: ResumeStatus.PENDING_PARSE },
      });

      const ai = getAIGateway();

      const prompt = `
        You are an expert HR assistant. Parse the following resume text and extract the candidate's skills, experience level, and summary.
        Return the result as a strict JSON object with this exact schema:
        {
          "skills": ["skill1", "skill2"],
          "experienceLevel": "JUNIOR" | "MID" | "SENIOR",
          "summary": "A brief 2 sentence summary"
        }

        Resume Text:
        ${fileText}
      `;

      try {
        const response = await ai.complete({
          messages: [
            { role: "system", content: "You are an expert HR assistant. Output ONLY valid JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          responseFormat: { type: "json_object" },
        });

        const parsedData = JSON.parse(response.content);

        // Save back to DB
        await prisma.candidateProfile.update({
          where: { id: candidateId },
          data: {
            resumeStatus: ResumeStatus.PARSED,
            // You can add fields for skills/summary if they exist, or just use a JSON column
            // We'll assume there is a metadata or we just emit the event
          },
        });

        // Emit domain event
        await eventBus.emit(DOMAIN_EVENTS.AI_ANALYSIS_COMPLETED, {
          candidateId,
          parsedData,
        });

        logger.info({ candidateId }, "Resume parsing completed");
      } catch (error) {
        logger.error({ candidateId, err: error }, "Resume parsing failed");
        throw error;
      }
    },
    { concurrency: 2 },
  );

  return workerInstance;
}
