import { prisma } from '@/core/database.js';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('DomainEventDispatcher');

export interface IDomainEvent {
  eventName:
    | 'AssessmentCreated'
    | 'AssessmentUpdated'
    | 'AssessmentPublished'
    | 'AssessmentArchived'
    | 'AssessmentDeleted'
    | 'AssessmentDuplicated'
    | 'AssessmentVersionCreated'
    | 'AssessmentTemplateCreated'
    | 'AssessmentViewed'
    | 'AssessmentStarted'
    | 'AssessmentSubmitted'
    | 'EvaluationStarted'
    | 'EvaluationCompleted'
    | 'EvaluationVerified'
    | 'EvaluationPublished'
    | 'CompanyCreated'
    | 'CompanyUpdated'
    | 'CompanyMemberAdded'
    | 'CompanyMemberRemoved'
    | 'CandidateJourneyStarted'
    | 'CandidateJourneyStatusChanged'
    | 'EvidenceRegistered'
    | 'SkillVerified'
    | 'SkillVerificationStatusChanged'
    | 'AIAssessmentGenerated'
    | 'RubricGenerated'
    | 'SkillsSuggested'
    | 'VersionRestored'
    | string;
  entityType: string;
  entityId: string;
  actorId?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export type DomainEventSubscriber = (event: IDomainEvent) => Promise<void> | void;

/**
 * Lightweight, in-memory CQRS-friendly Domain Event Dispatcher.
 * Publishes events to in-memory subscribers and automatically records an immutable
 * compliance log in `domain_event_logs` and `activity_timeline_entries`.
 */
export class DomainEventDispatcher {
  private static instance: DomainEventDispatcher;
  private subscribers: Map<string, DomainEventSubscriber[]> = new Map();

  private constructor() {}

  public static getInstance(): DomainEventDispatcher {
    if (!DomainEventDispatcher.instance) {
      DomainEventDispatcher.instance = new DomainEventDispatcher();
    }
    return DomainEventDispatcher.instance;
  }

  /**
   * Register a subscriber for a specific event name or '*' for all events.
   */
  public subscribe(eventName: string, subscriber: DomainEventSubscriber): void {
    const handlers = this.subscribers.get(eventName) || [];
    handlers.push(subscriber);
    this.subscribers.set(eventName, handlers);
  }

  /**
   * Dispatch a domain event asynchronously.
   */
  public async dispatch(event: IDomainEvent): Promise<void> {
    const ev: IDomainEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
      metadata: event.metadata || {},
    };

    log.info(
      { eventName: ev.eventName, entityType: ev.entityType, entityId: ev.entityId },
      'Dispatching domain event',
    );

    // 1. Asynchronously persist to DomainEventLog & ActivityTimelineEntry without blocking
    this.persistEventLog(ev).catch((err) => {
      log.error({ err, eventName: ev.eventName }, 'Failed to persist domain event log to database');
    });

    // 2. Invoke specific handlers
    const specificHandlers = this.subscribers.get(ev.eventName) || [];
    const globalHandlers = this.subscribers.get('*') || [];
    const allHandlers = [...specificHandlers, ...globalHandlers];

    await Promise.all(
      allHandlers.map(async (handler) => {
        try {
          await handler(ev);
        } catch (err) {
          log.error({ err, eventName: ev.eventName }, 'Subscriber error while handling domain event');
        }
      }),
    );
  }

  private async persistEventLog(event: IDomainEvent): Promise<void> {
    // Save to immutable DomainEventLog table
    await prisma.domainEventLog.create({
      data: {
        eventType: event.eventName,
        entityType: event.entityType,
        entityId: event.entityId,
        actorId: event.actorId || null,
        metadata: event.metadata || {},
        createdAt: event.timestamp || new Date(),
      },
    });

    const metadata = event.metadata || {};
    const assessmentId =
      event.entityType === 'ASSESSMENT'
        ? event.entityId
        : metadata['assessmentId'] || null;

    const companyId = metadata['companyId'] || null;
    const userId = event.actorId || metadata['userId'] || null;

    await prisma.activityTimelineEntry.create({
      data: {
        assessmentId: assessmentId || null,
        companyId: companyId || null,
        userId: userId || null,
        entityType: event.entityType,
        entityId: event.entityId,
        action: event.eventName,
        metadata: event.metadata || {},
        createdAt: event.timestamp || new Date(),
      },
    });
  }

  /**
   * Clear subscribers (useful in unit tests).
   */
  public clearSubscribers(): void {
    this.subscribers.clear();
  }
}
