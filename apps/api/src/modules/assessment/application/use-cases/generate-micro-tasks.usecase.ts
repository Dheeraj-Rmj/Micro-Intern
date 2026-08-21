import { createModuleLogger } from '@/core/logger.js';
import { PROMPTS, compilePrompt } from '@/infrastructure/ai/PromptManager.js';
import type { AIFallbackEngine } from '@/infrastructure/ai/AIFallbackEngine.js';
import type { IAssessmentRepository } from '../../application/ports/IAssessmentRepository.js';
import { TaskType } from '@microintern/database';

const log = createModuleLogger('GenerateMicroTasksUseCase');

export type GenerateMicroTasksInput = {
  projectContext: string;
  techStack: string;
  difficulty: string;
  companyId: string;
  createdById: string;
};

export type GeneratedMicroTaskBlueprint = {
  blueprint: {
    title: string;
    description: string;
    tasks: Array<{
      type: 'CODE' | 'MCQ';
      title: string;
      description: string;
      maxPoints: number;
      starterCode?: string;
      rubric?: string[];
    }>;
  };
};

export class GenerateMicroTasksUseCase {
  constructor(
    private readonly aiEngine: AIFallbackEngine,
    private readonly assessmentRepository: IAssessmentRepository
  ) {}

  async execute(input: GenerateMicroTasksInput): Promise<{ id: string }> {
    log.info({ companyId: input.companyId }, 'Generating Micro-Tasks via AI');

    try {
      const prompt = compilePrompt(PROMPTS.MICRO_TASK_GENERATOR, {
        projectContext: input.projectContext,
        techStack: input.techStack,
        difficulty: input.difficulty,
      });

      const response = await this.aiEngine.complete({
        messages: [
          { role: 'system', content: prompt.systemMessage },
          { role: 'user', content: prompt.userMessage },
        ],
        responseFormat: { type: 'json_object' },
      });

      const parsed = JSON.parse(response.content) as GeneratedMicroTaskBlueprint;

      if (!parsed.blueprint || !Array.isArray(parsed.blueprint.tasks)) {
        throw new Error('AI returned invalid JSON structure for micro-tasks');
      }

      // Convert generated title into a unique slug
      const slug = parsed.blueprint.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now();

      const assessment = await this.assessmentRepository.create({
        companyId: input.companyId,
        createdById: input.createdById,
        title: parsed.blueprint.title,
        slug,
        description: parsed.blueprint.description,
        instructions: 'Complete the following micro-tasks within the given context.',
        durationMinutes: 120, // Default duration for micro-tasks
        tasks: parsed.blueprint.tasks.map((task, index) => ({
          sortOrder: index,
          title: task.title,
          description: task.description,
          taskType: task.type === 'CODE' ? TaskType.CODE_SUBMISSION : TaskType.MULTIPLE_CHOICE,
          maxPoints: task.maxPoints || 100,
          config: {
            starterCode: task.starterCode || '',
            rubric: task.rubric || [],
          },
        })),
      });
      const assessmentId = assessment.id;

      log.info(
        {
          assessmentId,
          taskCount: parsed.blueprint.tasks.length,
        },
        'Successfully generated micro-tasks',
      );

      return { id: assessmentId };
    } catch (error) {
      log.error({ err: error }, 'Failed to generate micro-tasks');
      throw new Error('Failed to generate micro-tasks using AI');
    }
  }
}
