import { UserRole } from './roles';

export type Action =
  | 'SETUP_INSTITUTION'
  | 'CREATE_EXAM'
  | 'PUBLISH_EXAM'
  | 'JOIN_EXAM'
  | 'SUBMIT_EXAM';

export interface PermissionContext {
  schoolId?: string;
  examId?: string;
  studentId?: string;
}

/**
 * Centrally resolves role permissions.
 * All checks for action authorization MUST go through this function.
 * NO role logic is permitted inside React components directly.
 */
export function canPerform(
  role: UserRole,
  action: Action,
  _context?: PermissionContext
): boolean {
  switch (role) {
    case 'admin':
    case 'super_admin':
      return action === 'SETUP_INSTITUTION' || action === 'CREATE_EXAM' || action === 'PUBLISH_EXAM';
    case 'teacher':
      return action === 'CREATE_EXAM' || action === 'PUBLISH_EXAM';
    case 'student':
      return action === 'JOIN_EXAM' || action === 'SUBMIT_EXAM';
    default:
      return false;
  }
}
