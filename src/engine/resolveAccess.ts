import { UserRole } from '../domain/roles';
import { Action, canPerform, PermissionContext } from '../domain/permissions';

/**
 * Enforces role-based access centrally before any engine action.
 * Throws an error if the role does not have permission for the requested action.
 */
export function resolveAccess(
  role: UserRole,
  action: Action,
  context?: PermissionContext
): void {
  if (!canPerform(role, action, context)) {
    throw new Error(`ACCESS_DENIED: Role "${role}" is unauthorized to perform action "${action}"`);
  }
}
