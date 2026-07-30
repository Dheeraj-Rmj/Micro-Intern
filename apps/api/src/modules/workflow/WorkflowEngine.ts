import { prisma } from '@/core/database.js';
import { createModuleLogger } from '@/core/logger.js';
import { DomainEventDispatcher } from '@/core/events/DomainEventDispatcher.js';
import { AssessmentNotFoundError } from '@/modules/assessment/domain/errors/assessment.errors.js';
import { AppError } from '@/shared/errors/AppError.js';

const log = createModuleLogger('WorkflowEngine');

export class WorkflowTransitionDeniedError extends AppError {
  constructor(fromState: string, toState: string, role: string) {
    super({
      message: `Role ${role} is not authorized to transition workflow from ${fromState} to ${toState}`,
      statusCode: 403,
      code: 'WORKFLOW_TRANSITION_DENIED' as any,
    });
  }
}

export interface IWorkflowEngine {
  getAvailableTransitions(workflowId: string, currentState: string, userRole: string): Promise<string[]>;
  transitionState(assessmentId: string, workflowId: string, toState: string, userRole: string, userId?: string): Promise<any>;
  initializeDefaultPublishingWorkflow(): Promise<any>;
}

/**
 * Enterprise Configurable Workflow Engine.
 * Replaces hardcoded status checks with configurable state machine transitions,
 * role permissions, and audit event dispatching.
 */
export class WorkflowEngine implements IWorkflowEngine {
  private static instance: WorkflowEngine;

  private constructor() {}

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  /**
   * Get all target states a user can transition to from currentState.
   */
  public async getAvailableTransitions(
    workflowId: string,
    currentState: string,
    userRole: string,
  ): Promise<string[]> {
    const transitions = await prisma.workflowTransition.findMany({
      where: {
        workflowId,
        fromState: currentState as any,
      },
    });

    const roleRank: Record<string, number> = {
      CANDIDATE: 0,
      RECRUITER: 1,
      ADMIN: 2,
      COMPANY_OWNER: 3,
      SUPER_ADMIN: 4,
    };
    const currentRank = roleRank[userRole] ?? 0;

    return transitions
      .filter((t) => currentRank >= (roleRank[t.requiredRole] ?? 1))
      .map((t) => t.toState);
  }

  /**
   * Transition an entity state if authorized.
   */
  public async transitionState(
    assessmentId: string,
    workflowId: string,
    toState: string,
    userRole: string,
    userId?: string,
  ): Promise<any> {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    const available = await this.getAvailableTransitions(workflowId, assessment.status, userRole);
    if (!available.includes(toState) && userRole !== 'SUPER_ADMIN' && userRole !== 'COMPANY_OWNER') {
      throw new WorkflowTransitionDeniedError(assessment.status, toState, userRole);
    }

    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: toState as any,
        updatedAt: new Date(),
        updatedBy: userId || null,
        ...(toState === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
      },
    });

    // Publish domain event
    await DomainEventDispatcher.getInstance().dispatch({
      eventName: 'AssessmentUpdated',
      entityType: 'ASSESSMENT',
      entityId: assessmentId,
      actorId: userId,
      metadata: {
        previousState: assessment.status,
        newState: toState,
        workflowId,
      },
    });

    return updated;
  }

  /**
   * Initialize default Enterprise Approval Workflow in database:
   * Recruiter -> Reviewer -> Company Owner -> Published
   */
  public async initializeDefaultPublishingWorkflow(): Promise<any> {
    const defaultName = 'ENTERPRISE_ASSESSMENT_PUBLISHING';

    return prisma.workflowDefinition.upsert({
      where: { name: defaultName },
      create: {
        name: defaultName,
        description: 'Standard 3-stage enterprise assessment publishing and approval workflow',
        isActive: true,
        states: {
          create: [
            { stateName: 'DRAFT', label: 'Draft', isInitial: true, isTerminal: false },
            { stateName: 'REVIEW_PENDING', label: 'Pending Technical Review', isInitial: false, isTerminal: false },
            { stateName: 'APPROVED', label: 'Approved by Reviewer', isInitial: false, isTerminal: false },
            { stateName: 'PUBLISHED', label: 'Published to Marketplace', isInitial: false, isTerminal: false },
            { stateName: 'ARCHIVED', label: 'Archived', isInitial: false, isTerminal: true },
          ],
        },
        transitions: {
          create: [
            { fromState: 'DRAFT', toState: 'REVIEW_PENDING', requiredRole: 'RECRUITER' },
            { fromState: 'REVIEW_PENDING', toState: 'APPROVED', requiredRole: 'ADMIN' },
            { fromState: 'APPROVED', toState: 'PUBLISHED', requiredRole: 'COMPANY_OWNER' },
            { fromState: 'DRAFT', toState: 'PUBLISHED', requiredRole: 'COMPANY_OWNER' }, // Fast path for owners
            { fromState: 'PUBLISHED', toState: 'ARCHIVED', requiredRole: 'RECRUITER' },
          ],
        },
      },
      update: {
        isActive: true,
      },
    });
  }
}

export const workflowEngine = WorkflowEngine.getInstance();
