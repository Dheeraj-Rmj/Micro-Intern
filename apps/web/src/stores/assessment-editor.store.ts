import { create } from "zustand";
import type {
  AssessmentDto,
  AssessmentTaskDto,
  AssessmentDeliverableDto,
  AssessmentValidationResult,
} from "@/lib/api/assessment";

export type AssessmentSectionKey =
  | "OVERVIEW"
  | "COMPETENCY"
  | "LEARNING_OUTCOMES"
  | "TECHNICAL"
  | "COMMUNICATION"
  | "RESEARCH"
  | "BONUS"
  | "SUBMISSION";

export interface AIJobStatusState {
  jobId: string;
  action: string;
  status: "idle" | "running" | "completed" | "error";
  message?: string;
}

interface AssessmentEditorState {
  assessment: AssessmentDto | null;
  activeSection: AssessmentSectionKey;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  validationResult: AssessmentValidationResult | null;
  aiJobStatus: AIJobStatusState | null;

  setAssessment: (assessment: AssessmentDto | null) => void;
  updateAssessmentField: (field: keyof AssessmentDto, value: unknown) => void;
  addTask: (task: AssessmentTaskDto) => void;
  updateTask: (index: number, task: Partial<AssessmentTaskDto>) => void;
  removeTask: (index: number) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  addDeliverable: (deliverable: AssessmentDeliverableDto) => void;
  removeDeliverable: (index: number) => void;
  setActiveSection: (section: AssessmentSectionKey) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (time: Date) => void;
  setValidationResult: (res: AssessmentValidationResult | null) => void;
  setAIJobStatus: (status: AIJobStatusState | null) => void;
  reset: () => void;
}

const initialAssessmentState = {
  assessment: null,
  activeSection: "OVERVIEW" as AssessmentSectionKey,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  validationResult: null,
  aiJobStatus: null,
};

export const useAssessmentEditorStore = create<AssessmentEditorState>((set, get) => ({
  ...initialAssessmentState,

  setAssessment: (assessment) => {
    set({
      assessment,
      isDirty: false,
      validationResult: null,
    });
  },

  updateAssessmentField: (field, value) => {
    const { assessment } = get();
    if (!assessment) return;

    set({
      assessment: {
        ...assessment,
        [field]: value,
      },
      isDirty: true,
    });
  },

  addTask: (task) => {
    const { assessment } = get();
    if (!assessment) return;

    const tasks = [
      ...(assessment.tasks || []),
      { ...task, sortOrder: (assessment.tasks?.length || 0) + 1 },
    ];
    set({
      assessment: { ...assessment, tasks },
      isDirty: true,
    });
  },

  updateTask: (index, taskUpdates) => {
    const { assessment } = get();
    if (!assessment || !assessment.tasks) return;

    const tasks = [...assessment.tasks];
    if (!tasks[index]) return;

    tasks[index] = { ...tasks[index], ...taskUpdates };
    set({
      assessment: { ...assessment, tasks },
      isDirty: true,
    });
  },

  removeTask: (index) => {
    const { assessment } = get();
    if (!assessment || !assessment.tasks) return;

    const tasks = assessment.tasks
      .filter((_, idx) => idx !== index)
      .map((t, idx) => ({ ...t, sortOrder: idx + 1 }));
    set({
      assessment: { ...assessment, tasks },
      isDirty: true,
    });
  },

  reorderTasks: (startIndex, endIndex) => {
    const { assessment } = get();
    if (!assessment || !assessment.tasks) return;

    const tasks = [...assessment.tasks];
    const [moved] = tasks.splice(startIndex, 1);
    if (!moved) return;

    tasks.splice(endIndex, 0, moved);
    const updated = tasks.map((t, idx) => ({ ...t, sortOrder: idx + 1 }));

    set({
      assessment: { ...assessment, tasks: updated },
      isDirty: true,
    });
  },

  addDeliverable: (deliverable) => {
    const { assessment } = get();
    if (!assessment) return;

    const deliverables = [...(assessment.deliverables || []), deliverable];
    set({
      assessment: { ...assessment, deliverables },
      isDirty: true,
    });
  },

  removeDeliverable: (index) => {
    const { assessment } = get();
    if (!assessment || !assessment.deliverables) return;

    const deliverables = assessment.deliverables.filter((_, idx) => idx !== index);
    set({
      assessment: { ...assessment, deliverables },
      isDirty: true,
    });
  },

  setActiveSection: (section) => set({ activeSection: section }),
  setDirty: (isDirty) => set({ isDirty }),
  setSaving: (isSaving) => set({ isSaving }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
  setValidationResult: (validationResult) => set({ validationResult }),
  setAIJobStatus: (aiJobStatus) => set({ aiJobStatus }),
  reset: () => set(initialAssessmentState),
}));
