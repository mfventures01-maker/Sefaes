export type CBTSessionState = 
  | 'INITIALIZING'
  | 'AUTHENTICATED'
  | 'LOADING_EXAM'
  | 'INSTRUCTIONS_VIEW'
  | 'ACTIVE_EXAM'
  | 'PAUSED'
  | 'SUBMITTED'
  | 'SCORED';

export const CBTSessionStates = {
  INITIALIZING: 'INITIALIZING' as const,
  AUTHENTICATED: 'AUTHENTICATED' as const,
  LOADING_EXAM: 'LOADING_EXAM' as const,
  INSTRUCTIONS_VIEW: 'INSTRUCTIONS_VIEW' as const,
  ACTIVE_EXAM: 'ACTIVE_EXAM' as const,
  PAUSED: 'PAUSED' as const,
  SUBMITTED: 'SUBMITTED' as const,
  SCORED: 'SCORED' as const
};

const PERMITTED_TRANSITIONS: Record<CBTSessionState, CBTSessionState[]> = {
  INITIALIZING: ['AUTHENTICATED'],
  AUTHENTICATED: ['LOADING_EXAM'],
  LOADING_EXAM: ['INSTRUCTIONS_VIEW'],
  INSTRUCTIONS_VIEW: ['ACTIVE_EXAM'],
  ACTIVE_EXAM: ['PAUSED', 'SUBMITTED', 'SCORED'],
  PAUSED: ['ACTIVE_EXAM', 'SCORED'],
  SUBMITTED: ['SCORED'],
  SCORED: []
};

export class CBTSessionFSM {
  public static isValidTransition(from: string, to: string): boolean {
    const fromState = from as CBTSessionState;
    const toState = to as CBTSessionState;
    const allowed = PERMITTED_TRANSITIONS[fromState];
    if (!allowed) return false;
    return allowed.includes(toState);
  }
}
