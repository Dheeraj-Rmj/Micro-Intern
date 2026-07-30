import { createModuleLogger } from "@/core/logger.js";
import {
  competencyRepository,
  type ICompetencyRepository,
} from "../infrastructure/CompetencyRepository.js";

const log = createModuleLogger("CompetencyService");

export interface ICompetencyService {
  seedDefaultEnterpriseCompetencies(): Promise<void>;
  listAllCompetencies(category?: string): Promise<any[]>;
  getAssessmentCompetencyMatrix(assessmentId: string): Promise<{
    competencies: Array<{
      id: string;
      name: string;
      category: string;
      weight: number;
      importance: string;
    }>;
    totalWeight: number;
    isValidWeight: boolean;
  }>;
  mapCompetencyToAssessment(
    assessmentId: string,
    competencyName: string,
    weight: number,
    importance?: string,
  ): Promise<any>;
}

export class CompetencyService implements ICompetencyService {
  constructor(private readonly repo: ICompetencyRepository = competencyRepository) {}

  /**
   * Seed the 16 core enterprise competencies into the system database.
   */
  public async seedDefaultEnterpriseCompetencies(): Promise<void> {
    const defaults = [
      {
        name: "Problem Solving",
        category: "Core",
        description: "Ability to dissect complex challenges into tractable algorithmic steps",
      },
      {
        name: "Critical Thinking",
        category: "Core",
        description: "Objective analysis and reasoned judgment on design trade-offs",
      },
      {
        name: "Communication",
        category: "Collaboration",
        description: "Clear articulation of technical concepts and documentation",
      },
      {
        name: "System Design",
        category: "Architecture",
        description: "Designing scalable, resilient distributed software systems",
      },
      {
        name: "Architecture",
        category: "Architecture",
        description: "Clean architecture, domain modeling, and layer separation",
      },
      {
        name: "Code Quality",
        category: "Engineering",
        description: "Writing readable, maintainable, and modular production code",
      },
      {
        name: "Testing",
        category: "Engineering",
        description: "Comprehensive unit, integration, and contract testing coverage",
      },
      {
        name: "Debugging",
        category: "Engineering",
        description: "Systematic troubleshooting and root-cause defect resolution",
      },
      {
        name: "Documentation",
        category: "Communication",
        description: "Authoring concise architectural readmes and API specifications",
      },
      {
        name: "Security",
        category: "Engineering",
        description: "Securing endpoints, authentication, and data privacy hardening",
      },
      {
        name: "Performance",
        category: "Engineering",
        description: "Optimizing algorithmic latency, query costs, and resource consumption",
      },
      {
        name: "Ownership",
        category: "Leadership",
        description: "Taking accountability for end-to-end deliverable execution",
      },
      {
        name: "Leadership",
        category: "Leadership",
        description: "Mentoring peers and guiding technical alignment",
      },
      {
        name: "Collaboration",
        category: "Collaboration",
        description: "Working constructively across asynchronous cross-functional teams",
      },
      {
        name: "Research",
        category: "Core",
        description: "Investigatory analysis of emerging technologies and industry standards",
      },
      {
        name: "Decision Making",
        category: "Leadership",
        description: "Pragmatic technical decision making under time and constraint ambiguity",
      },
    ];

    for (const comp of defaults) {
      await this.repo.createCompetency(comp);
    }
    log.info("Seeded default 16 enterprise competencies");
  }

  public async listAllCompetencies(category?: string): Promise<any[]> {
    return this.repo.listAll(category);
  }

  /**
   * Get the percentage Competency Matrix for an Enterprise Assessment.
   */
  public async getAssessmentCompetencyMatrix(assessmentId: string): Promise<{
    competencies: Array<{
      id: string;
      name: string;
      category: string;
      weight: number;
      importance: string;
    }>;
    totalWeight: number;
    isValidWeight: boolean;
  }> {
    const mappings = await this.repo.listMappingsForAssessment(assessmentId);
    let totalWeight = 0;

    const competencies = mappings.map((m) => {
      totalWeight += m.weight || 0;
      return {
        id: m.competency?.id || m.competencyId,
        name: m.competency?.name || "Unknown Competency",
        category: m.competency?.category || "Core",
        weight: m.weight || 0,
        importance: m.importance || "MEDIUM",
      };
    });

    // Valid matrix weights sum around 100% (with small floating tolerance)
    const isValidWeight = Math.abs(totalWeight - 100) < 0.5 || totalWeight === 0;

    return {
      competencies,
      totalWeight: Number(totalWeight.toFixed(1)),
      isValidWeight,
    };
  }

  public async mapCompetencyToAssessment(
    assessmentId: string,
    competencyName: string,
    weight: number,
    importance = "MEDIUM",
  ): Promise<any> {
    let comp = await this.repo.findByName(competencyName);
    if (!comp) {
      comp = await this.repo.createCompetency({
        name: competencyName,
        description: `Competency in ${competencyName}`,
      });
    }

    return this.repo.upsertMapping({
      competencyId: comp.id,
      assessmentId,
      weight,
      importance: importance as any,
    });
  }
}

export const competencyService = new CompetencyService();
