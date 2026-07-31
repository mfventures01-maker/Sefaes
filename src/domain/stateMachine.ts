export type SystemState = 'setup' | 'ready' | 'exam_active' | 'grading' | 'completed';

export const VALID_TRANSITIONS: Record<SystemState, SystemState[]> = {
  setup: ['ready'],
  ready: ['exam_active'],
  exam_active: ['grading'],
  grading: ['completed'],
  completed: []
};

/**
 * Validates a transition between two states.
 * If the transition is invalid, it throws "INVALID_STATE_TRANSITION".
 */
export function validateStateTransition(current: SystemState, next: SystemState): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new Error('INVALID_STATE_TRANSITION');
  }
}
