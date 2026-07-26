import { TrialStatus, TaskType } from '@microintern/database';
import { describe, it, expect } from 'vitest';

import { Trial } from '@/modules/trial/domain/entities/Trial.entity.js';
import { TrialTask } from '@/modules/trial/domain/entities/TrialTask.entity.js';
import { TrialCannotPublishWithoutTasksError, TrialImmutableWhenPublishedError } from '@/modules/trial/domain/errors/trial.errors.js';

describe('Trial & TrialTask Domain Entities', () => {
  const sampleTask = new TrialTask(
    'task-1',
    'trial-1',
    1,
    'Build API endpoint',
    'Implement POST /test using express',
    TaskType.CODE_SUBMISSION,
    true,
    100,
    { language: 'typescript', answerKey: 'secret-solution-code', privateRubric: 'Check async/await usage' },
    new Date(),
    new Date()
  );

  const sampleTrial = (status: TrialStatus, tasks: TrialTask[] = []) =>
    new Trial(
      'trial-1',
      'comp-1',
      'user-1',
      status,
      'Backend Systems Trial',
      'backend-systems-trial',
      'An intense Node.js backend evaluation.',
      'Complete all required endpoints.',
      ['TypeScript', 'Node.js'],
      'Senior Backend Developer',
      null,
      90,
      75,
      2,
      true,
      status === TrialStatus.PUBLISHED ? new Date() : null,
      null,
      new Date(),
      new Date(),
      tasks
    );

  it('should throw TrialCannotPublishWithoutTasksError when attempting to publish a Trial with 0 tasks', () => {
    const draftWithoutTasks = sampleTrial(TrialStatus.DRAFT, []);
    expect(() => draftWithoutTasks.validateCanPublish()).toThrow(TrialCannotPublishWithoutTasksError);
  });

  it('should pass publish validation when at least one task exists', () => {
    const draftWithTasks = sampleTrial(TrialStatus.DRAFT, [sampleTask]);
    expect(() => draftWithTasks.validateCanPublish()).not.toThrow();
  });

  it('should throw TrialImmutableWhenPublishedError if trying to modify structural assessment tasks on a published or closed Trial', () => {
    const publishedTrial = sampleTrial(TrialStatus.PUBLISHED, [sampleTask]);
    expect(() => publishedTrial.validateCanBeModified()).toThrow(TrialImmutableWhenPublishedError);

    const closedTrial = sampleTrial(TrialStatus.CLOSED, [sampleTask]);
    expect(() => closedTrial.validateCanBeModified()).toThrow(TrialImmutableWhenPublishedError);
  });

  it('should securely mask answerKey, solution, and privateRubric when converting tasks to public candidate view', () => {
    const publishedTrial = sampleTrial(TrialStatus.PUBLISHED, [sampleTask]);
    const publicView = publishedTrial.toPublicCandidateView();

    expect(publicView.tasks).toHaveLength(1);
    const taskConfig = publicView.tasks[0]!.config;
    expect(taskConfig['language']).toBe('typescript');
    expect(taskConfig['answerKey']).toBeUndefined();
    expect(taskConfig['privateRubric']).toBeUndefined();
  });
});
