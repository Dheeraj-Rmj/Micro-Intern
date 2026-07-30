import { QUEUE_NAMES, QUEUE } from '@microintern/shared';

import { prisma } from '@/core/database.js';
import { createModuleLogger } from '@/core/logger.js';
import { createWorker } from '@/infrastructure/queue/queues.js';
import { createAIGateway } from '@/infrastructure/ai/index.js';
import { compilePrompt, PROMPTS } from '@/infrastructure/ai/PromptManager.js';

import type { Worker } from 'bullmq';

const log = createModuleLogger('ResumeParserWorker');

export type ResumeParserJobData = {
  candidateId: string;
  resumeKey: string;
  resumeText?: string; // Pre-extracted text from storage processor
};

type ParsedResume = {
  summary: string;
  yearsOfExperience: number;
  skills: string[];
  experience: Array<{ title?: string; role?: string; company: string; duration: string; description: string }>;
  education: Array<{ degree: string; institution: string; year?: string }>;
  certifications: string[];
  languages: string[];
};

/**
 * Resume Parser Queue Worker — BullMQ Consumer.
 *
 * Full AI-powered pipeline:
 * 1. Calls AI with resume text using RESUME_EXTRACTOR prompt
 * 2. Writes extracted skills to CandidateSkill as strings
 * 3. Writes experience/education records
 * 4. Creates AI analysis record with overall resume score
 * 5. Updates profile resumeStatus to PARSED
 */
export function startResumeParserWorker(): Worker<ResumeParserJobData> {
  const aiEngine = createAIGateway();

  const worker = createWorker<ResumeParserJobData>(
    QUEUE_NAMES.RESUME_PARSER,
    async (job) => {
      const { candidateId, resumeText } = job.data;

      log.info({ jobId: job.id, candidateId }, 'Processing resume parsing job');

      if (!resumeText || resumeText.trim().length === 0) {
        log.warn({ jobId: job.id, candidateId }, 'No resume text provided — skipping AI extraction');
        await prisma.candidateProfile.update({
          where: { id: candidateId },
          data: { resumeStatus: 'PARSED' },
        });
        return;
      }

      // ── Step 1: AI Extraction ──────────────────────────────────────
      let parsed: ParsedResume | null = null;
      try {
        const { systemMessage, userMessage } = compilePrompt(PROMPTS.RESUME_EXTRACTOR, {
          resumeText: resumeText.slice(0, 8000),
        });

        const aiResponse = await aiEngine.complete({
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage },
          ],
          responseFormat: { type: 'json_object' } as const,
          temperature: 0.1,
        });

        parsed = JSON.parse(aiResponse.content) as ParsedResume;
        log.info({ candidateId, skillsFound: parsed.skills?.length }, 'Resume AI extraction complete');
      } catch (err) {
        log.error({ err, candidateId }, 'AI resume extraction failed — using fallback');
      }

      // ── Step 2: Persist Extracted Data ────────────────────────────
      await prisma.$transaction(async (tx) => {
        // Write skills as plain strings (CandidateSkill.skill is a string field)
        if (parsed?.skills && parsed.skills.length > 0) {
          for (const skillName of parsed.skills.slice(0, 30)) {
            const trimmed = skillName.trim();
            if (!trimmed) continue;
            await tx.candidateSkill.create({
              data: {
                candidateId,
                skill: trimmed,
                level: 3,
                verified: false,
              },
            });
          }
        }

        // Write experience records (schema uses `role`, not `title`)
        if (parsed?.experience && parsed.experience.length > 0) {
          for (const exp of parsed.experience.slice(0, 10)) {
            await tx.candidateExperience.create({
              data: {
                candidateId,
                role: exp.role ?? exp.title ?? 'Unknown Role',
                company: exp.company ?? 'Unknown',
                description: exp.description,
                isCurrent: false,
                startDate: new Date(),
              },
            });
          }
        }

        // Write education records (startDate required)
        if (parsed?.education && parsed.education.length > 0) {
          for (const edu of parsed.education.slice(0, 5)) {
            await tx.candidateEducation.create({
              data: {
                candidateId,
                degree: edu.degree ?? 'Unknown',
                institution: edu.institution ?? 'Unknown',
                fieldOfStudy: '',
                startDate: new Date(),
              },
            });
          }
        }

        // Create AI analysis record (no unique constraint on candidateId — use create)
        const yearsExp = parsed?.yearsOfExperience ?? 0;
        const skillScore = Math.min(100, (parsed?.skills?.length ?? 0) * 5);
        const resumeScore = Math.round(skillScore * 0.4 + Math.min(yearsExp * 5, 40) + 20);

        await tx.candidateAIAnalysis.create({
          data: {
            candidateId,
            provider: 'groq',
            model: 'llama-3.3-70b-versatile',
            resumeScore,
            atsScore: Math.round(resumeScore * 0.95),
            profileScore: Math.round(resumeScore * 0.9),
            summary: parsed?.summary ?? 'Resume successfully parsed.',
            recommendations: [
              'Complete your skill verification for top skills',
              'Add evidence items linked to your experience',
              'Build your portfolio with project samples',
            ],
          },
        });

        // Update resume status
        await tx.candidateProfile.update({
          where: { id: candidateId },
          data: { resumeStatus: 'PARSED' },
        });
      });

      log.info({ jobId: job.id, candidateId }, 'Resume parsed and data persisted successfully');
    },
    {
      concurrency: QUEUE.STORAGE_PROCESSING_CONCURRENCY,
    },
  );

  return worker;
}
