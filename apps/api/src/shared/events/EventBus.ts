/**
 * In-process Domain Event Bus.
 *
 * Design: Modules communicate through domain events, not direct calls.
 * This preserves module isolation — the Trial module doesn't import from the
 * Notification module; it emits a TrialSubmitted event, and the Notification
 * module subscribes independently.
 *
 * This is NOT a message queue. Events are synchronous within the same process.
 * For durable, cross-service events, use BullMQ (infrastructure/queue/queues.ts).
 *
 * Usage:
 *   // Publisher (in use case):
 *   eventBus.emit('trial.submitted', { submissionId, candidateId, trialId });
 *
 *   // Subscriber (in another module's bootstrap):
 *   eventBus.on('trial.submitted', async (payload) => {
 *     await notificationService.notifyEvaluationPending(payload);
 *   });
 */

export type DomainEvent<T = unknown> = {
  name: string;
  payload: T;
  timestamp: Date;
  correlationId?: string;
};

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void> | void;

/**
 * All domain event names — exhaustive list.
 * Adding new events here makes them discoverable across the codebase.
 */
export const DOMAIN_EVENTS = {
  // Auth events
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',
  USER_EMAIL_VERIFIED: 'user.email_verified',
  USER_PASSWORD_CHANGED: 'user.password_changed',

  // Company events
  COMPANY_CREATED: 'company.created',
  COMPANY_MEMBER_INVITED: 'company.member_invited',
  COMPANY_MEMBER_JOINED: 'company.member_joined',

  // Trial events
  TRIAL_PUBLISHED: 'trial.published',
  TRIAL_INVITATION_SENT: 'trial.invitation_sent',
  TRIAL_STARTED: 'trial.started',
  TRIAL_SUBMITTED: 'trial.submitted',

  // Evaluation events
  EVALUATION_STARTED: 'evaluation.started',
  EVALUATION_COMPLETED: 'evaluation.completed',
  EVALUATION_REQUIRES_REVIEW: 'evaluation.requires_review',

  // Pipeline events
  PIPELINE_CANDIDATE_MOVED: 'pipeline.candidate_moved',
} as const;

export type DomainEventName = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS];

class EventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  /**
   * Subscribe to a domain event.
   * Returns an unsubscribe function.
   */
  on<T = unknown>(eventName: DomainEventName, handler: EventHandler<T>): () => void {
    const existing = this.handlers.get(eventName) ?? [];
    this.handlers.set(eventName, [...existing, handler as EventHandler]);

    return () => {
      const handlers = this.handlers.get(eventName) ?? [];
      this.handlers.set(
        eventName,
        handlers.filter((h) => h !== handler),
      );
    };
  }

  /**
   * Emit a domain event. All handlers are called sequentially.
   * Handler errors are caught and logged — they never block the emitter.
   */
  async emit<T = unknown>(
    eventName: DomainEventName,
    payload: T,
    correlationId?: string,
  ): Promise<void> {
    const handlers = this.handlers.get(eventName) ?? [];

    if (handlers.length === 0) return;

    const event: DomainEvent<T> = {
      name: eventName,
      payload,
      timestamp: new Date(),
      correlationId,
    };

    await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          // Import logger lazily to avoid circular dependencies
          const { logger } = await import('../../core/logger.js');
          logger.error(
            { err: error, event: eventName },
            'Domain event handler threw an error',
          );
        }
      }),
    );
  }
}

/**
 * Singleton event bus — shared across the entire application.
 */
export const eventBus = new EventBus();
