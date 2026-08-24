import { prisma } from "@/core/database.js";
import { createModuleLogger } from "@/core/logger.js";
import { DomainEventDispatcher } from "@/core/events/DomainEventDispatcher.js";

const log = createModuleLogger("LearningOutcomeService");

export interface ILearningOutcomeService {
  listOutcomes(assessmentId: string): Promise<any[]>;
  setOutcomes(
    assessmentId: string,
    descriptions: string[],
    isAiGenerated?: boolean,
  ): Promise<any[]>;
  generateAIOutcomes(
    assessmentId: string,
    roleTitle: string,
    description: string,
  ): Promise<string[]>;
}

export class LearningOutcomeService implements ILearningOutcomeService {
  /**
   * List all learning outcomes defined for a Assessment, ordered by sort order.
   */
  public async listOutcomes(assessmentId: string): Promise<any[]> {
    return prisma.learningOutcome.findMany({
      where: { assessmentId },
      orderBy: { sortOrder: "asc" },
    });
  }

  /**
   * Replace or set learning outcomes for a Assessment.
   */
  public async setOutcomes(
    assessmentId: string,
    descriptions: string[],
    isAiGenerated = false,
  ): Promise<any[]> {
    await prisma.learningOutcome.deleteMany({
      where: { assessmentId },
    });

    const created = await Promise.all(
      descriptions.map((desc, idx) =>
        prisma.learningOutcome.create({
          data: {
            assessmentId,
            description: desc.trim(),
            sortOrder: idx + 1,
            isAiGenerated,
          },
        }),
      ),
    );

    // Record domain event and trigger version snapshot
    await DomainEventDispatcher.getInstance().dispatch({
      eventName: "AssessmentUpdated",
      entityType: "ASSESSMENT",
      entityId: assessmentId,
      metadata: {
        updateType: "LEARNING_OUTCOMES_UPDATED",
        outcomeCount: descriptions.length,
        isAiGenerated,
      },
    });

    log.info({ assessmentId, count: descriptions.length }, "Updated Assessment Learning Outcomes");
    return created;
  }

  /**
   * Generate default or AI-suggested high-signal Learning Outcomes for a Assessment.
   */
  public async generateAIOutcomes(
    assessmentId: string,
    roleTitle: string,
    description: string,
  ): Promise<string[]> {
    const role = roleTitle.toLowerCase();
    const outcomes: string[] = [];

    if (role.includes("backend") || role.includes("node") || role.includes("api")) {
      outcomes.push(
        "RESTful API Design & HTTP Status Code conventions",
        "Clean Architecture & Domain-Driven Design layer separation",
        "Authentication & Authorization (JWT / OAuth Token Security)",
        "Database Schema Modeling, Indexing, and Query Optimization",
        "Comprehensive Automated Testing (Unit & Integration suites)",
      );
    } else if (role.includes("frontend") || role.includes("react") || role.includes("web")) {
      outcomes.push(
        "Component Architecture & Reusable UI Design Systems",
        "State Management & Asynchronous Data Fetching caching",
        "Responsive Web Design & Dark-Mode Accessibility (WCAG)",
        "Performance Optimization & Bundle Latency Reduction",
        "Automated Component Testing & Visual Regression Checks",
      );
    } else {
      outcomes.push(
        "End-to-End System Architecture & Component Design",
        "Production Code Cleanliness, Naming, and Modularity",
        "Automated Testing Coverage and Edge-Case Hardening",
        "Concise Architectural Documentation & Readme specifications",
      );
    }

    await this.setOutcomes(assessmentId, outcomes, true);
    return outcomes;
  }
}

export const learningOutcomeService = new LearningOutcomeService();
