import { PipelineStageType } from '@microintern/shared';
import { describe, it, expect } from 'vitest';

import { Pipeline, PipelineStage, PipelineEntry, PipelineInvalidTransitionError, PipelineStageNotFoundError } from '@/modules/pipeline/domain/index.js';

describe('Pipeline Domain Layer Operations & Validation', () => {
  const mockDate = new Date(2026, 6, 26, 12, 0);

  describe('PipelineStage Entity', () => {
    it('should correctly identify terminal stages (OFFER, REJECTED, WITHDRAWN)', () => {
      const screeningStage = new PipelineStage('stage-1', 'pipe-1', 'Screening', PipelineStageType.SCREENING, 1);
      const offerStage = new PipelineStage('stage-2', 'pipe-1', 'Offer Made', PipelineStageType.OFFER, 4);
      const rejectedStage = new PipelineStage('stage-3', 'pipe-1', 'Rejected', PipelineStageType.REJECTED, 5);

      expect(screeningStage.isTerminal()).toBe(false);
      expect(offerStage.isTerminal()).toBe(true);
      expect(rejectedStage.isTerminal()).toBe(true);
    });
  });

  describe('PipelineEntry Entity Transition Validation', () => {
    const stage1 = new PipelineStage('stage-1', 'pipe-1', 'Screening', PipelineStageType.SCREENING, 1);
    const stage2 = new PipelineStage('stage-2', 'pipe-1', 'Tech Interview', PipelineStageType.TECHNICAL_INTERVIEW, 2);
    const foreignStage = new PipelineStage('stage-9', 'pipe-other', 'Screening', PipelineStageType.SCREENING, 1);

    const entry = new PipelineEntry('entry-1', 'pipe-1', 'stage-1', 'user-cand', mockDate, 'recruiter-1', 'Initial review', mockDate, mockDate);

    it('should pass validation when moving to a different stage within the same pipeline', () => {
      expect(() => entry.validateCanMoveTo(stage2)).not.toThrow();
    });

    it('should throw PipelineInvalidTransitionError if moving to the same stage candidate is currently in', () => {
      expect(() => entry.validateCanMoveTo(stage1)).toThrow(PipelineInvalidTransitionError);
      expect(() => entry.validateCanMoveTo(stage1)).toThrow(/already in the designated stage/);
    });

    it('should throw PipelineInvalidTransitionError if target stage belongs to a different pipeline', () => {
      expect(() => entry.validateCanMoveTo(foreignStage)).toThrow(PipelineInvalidTransitionError);
      expect(() => entry.validateCanMoveTo(foreignStage)).toThrow(/belongs to a different pipeline/);
    });
  });

  describe('Pipeline Entity Structure & Lookup', () => {
    const stage2 = new PipelineStage('stage-2', 'pipe-1', 'Tech Interview', PipelineStageType.TECHNICAL_INTERVIEW, 20);
    const stage1 = new PipelineStage('stage-1', 'pipe-1', 'Screening', PipelineStageType.SCREENING, 10);
    const stageReject = new PipelineStage('stage-rej', 'pipe-1', 'Rejected', PipelineStageType.REJECTED, 99);

    const pipeline = new Pipeline('pipe-1', 'comp-1', 'trial-1', 'Backend Eng Pipeline', 'Backend Eng', true, mockDate, mockDate, [stage2, stage1, stageReject], []);

    it('should return the stage with lowest sortOrder as initial stage', () => {
      const initial = pipeline.getInitialStage();
      expect(initial.id).toBe('stage-1');
      expect(initial.name).toBe('Screening');
    });

    it('should find stage by ID or throw PipelineStageNotFoundError if missing', () => {
      expect(pipeline.findStageById('stage-2')).toBe(stage2);
      expect(() => pipeline.findStageById('non-existent')).toThrow(PipelineStageNotFoundError);
    });

    it('should find the designated rejected stage if present', () => {
      expect(pipeline.getRejectedStage()?.id).toBe('stage-rej');
    });

    it('should throw PipelineStageNotFoundError when asking for initial stage on an empty pipeline', () => {
      const emptyPipeline = new Pipeline('pipe-empty', 'comp-1', 'trial-2', 'Empty', 'Dev', true, mockDate, mockDate, [], []);
      expect(() => emptyPipeline.getInitialStage()).toThrow(PipelineStageNotFoundError);
    });
  });
});
