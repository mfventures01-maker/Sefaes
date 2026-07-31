// ────────────────────────────────────────────────────────────────────────────
// SEFAES COMMAND AUTH GATE — AUTH GUARD (PERMISSION ENGINE)
// Strict role-based command authorization. Default = DENY.
// ────────────────────────────────────────────────────────────────────────────

import type { ResolvedIdentity } from './authResolver';

/**
 * Auth Command Types — the complete set of authentication commands.
 */
export const AUTH_COMMANDS = {
    SIGNUP_SELF:     'AUTH.SIGNUP_SELF',
    SIGN_IN:         'AUTH.SIGN_IN',
    SIGN_IN_ANONYMOUS: 'AUTH.SIGN_IN_ANONYMOUS',
    SIGN_OUT:        'AUTH.SIGN_OUT',
    CREATE_USER:     'AUTH.CREATE_USER',
    DELETE_USER:     'AUTH.DELETE_USER',
    UPDATE_ROLE:     'AUTH.UPDATE_ROLE',
    GET_SESSION:     'AUTH.GET_SESSION',
    GET_USER:        'AUTH.GET_USER',
    IDENTITY_RESOLVE_TEACHER: 'AUTH.IDENTITY_RESOLVE_TEACHER',
    RESET_PASSWORD:  'AUTH.RESET_PASSWORD',
    UPDATE_PASSWORD: 'AUTH.UPDATE_PASSWORD',
} as const;

export type AuthCommandType = typeof AUTH_COMMANDS[keyof typeof AUTH_COMMANDS];

import { StudentCommandTypes, ExamCommandTypes, ResultCommandTypes, CBTCommandTypes } from '../commands/eduCommands';

/**
 * Permission matrix: Command → Allowed Roles
 * Default = DENY. Unknown commands = BLOCKED.
 */
const PERMISSION_MAP: Record<string, readonly string[]> = {
    [AUTH_COMMANDS.SIGNUP_SELF]:     ['public'],
    [AUTH_COMMANDS.SIGN_IN]:         ['public'],
    [AUTH_COMMANDS.SIGN_IN_ANONYMOUS]: ['public'],
    [AUTH_COMMANDS.SIGN_OUT]:        ['authenticated', 'student', 'teacher', 'admin', 'principal_admin', 'examiner', 'ceo', 'super_admin'],
    [AUTH_COMMANDS.CREATE_USER]:     ['admin', 'principal_admin', 'super_admin'],
    [AUTH_COMMANDS.DELETE_USER]:     ['super_admin'],
    [AUTH_COMMANDS.UPDATE_ROLE]:     ['ceo', 'super_admin'],
    [AUTH_COMMANDS.GET_SESSION]:     ['public', 'authenticated', 'student', 'teacher', 'admin', 'principal_admin', 'examiner', 'ceo', 'super_admin'],
    [AUTH_COMMANDS.GET_USER]:        ['authenticated', 'student', 'teacher', 'admin', 'principal_admin', 'examiner', 'ceo', 'super_admin'],
    [AUTH_COMMANDS.IDENTITY_RESOLVE_TEACHER]: ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [AUTH_COMMANDS.RESET_PASSWORD]:  ['public'],
    [AUTH_COMMANDS.UPDATE_PASSWORD]: ['public'],

    // ── Student Domain ───────────────────────────────────────────────────────
    [StudentCommandTypes.STUDENT_READ]:           ['authenticated', 'student', 'teacher', 'admin', 'principal_admin', 'examiner', 'ceo', 'super_admin'],
    [StudentCommandTypes.STUDENT_ENROLL]:         ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [StudentCommandTypes.STUDENT_DEACTIVATE]:     ['admin', 'principal_admin', 'super_admin'],
    [StudentCommandTypes.STUDENT_TRANSFER_CLASS]: ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [StudentCommandTypes.STUDENTS_BULK_CREATE]:   ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [StudentCommandTypes.CLASSES_READ]:           ['authenticated', 'student', 'teacher', 'admin', 'principal_admin', 'examiner', 'ceo', 'super_admin'],
    [StudentCommandTypes.CLASSES_CREATE]:         ['admin', 'principal_admin', 'super_admin'],
    [StudentCommandTypes.CLASSES_DELETE]:         ['admin', 'principal_admin', 'super_admin'],
    [StudentCommandTypes.SUBJECTS_READ]:          ['authenticated', 'student', 'teacher', 'admin', 'principal_admin', 'examiner', 'ceo', 'super_admin'],
    [StudentCommandTypes.SUBJECTS_CREATE]:        ['admin', 'principal_admin', 'super_admin'],
    [StudentCommandTypes.CLASS_SUBJECTS_READ]:    ['authenticated', 'student', 'teacher', 'admin', 'principal_admin', 'examiner', 'ceo', 'super_admin'],
    [StudentCommandTypes.CLASS_SUBJECTS_CREATE]:  ['admin', 'principal_admin', 'super_admin'],
    [StudentCommandTypes.CLASS_SUBJECTS_DELETE]:  ['admin', 'principal_admin', 'super_admin'],

    [ExamCommandTypes.EXAM_CREATE]:               ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [ExamCommandTypes.EXAM_READ]:                 ['authenticated', 'student', 'teacher', 'admin', 'principal_admin', 'examiner', 'ceo', 'super_admin'],
    [ExamCommandTypes.EXAM_READ_WITH_SCHEMES]:    ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [ExamCommandTypes.EXAM_TRANSITION_STATE]:     ['teacher', 'admin', 'principal_admin', 'super_admin'],

    // ── Result Domain ────────────────────────────────────────────────────────
    [ResultCommandTypes.RESULT_READ]:             ['authenticated', 'student', 'teacher', 'admin', 'principal_admin', 'examiner', 'ceo', 'super_admin'],
    [ResultCommandTypes.RESULT_STATUS_READ]:      ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [ResultCommandTypes.RESULT_START_GRADING]:    ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [ResultCommandTypes.STORAGE_UPLOAD]:          ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [ResultCommandTypes.ANSWER_SCRIPT_CREATE]:     ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [ResultCommandTypes.OCR_PROCESS]:             ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [ResultCommandTypes.FINALIZE_GRADING]:         ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [ResultCommandTypes.RETRY_GRADING]:            ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [ResultCommandTypes.GENERATE_INSIGHTS]:        ['teacher', 'admin', 'principal_admin', 'super_admin'],
    [ResultCommandTypes.RESULT_FAIL_GRADING]:      ['teacher', 'admin', 'principal_admin', 'super_admin'],

    // ── CBT Domain ───────────────────────────────────────────────────────────
    [CBTCommandTypes.CBT_START_SESSION]:          ['student', 'teacher', 'admin', 'principal_admin', 'super_admin'],
    [CBTCommandTypes.CBT_LOAD_EXAM]:              ['student', 'teacher', 'admin', 'principal_admin', 'super_admin'],
    [CBTCommandTypes.CBT_BEGIN_EXAM]:             ['student', 'teacher', 'admin', 'principal_admin', 'super_admin'],
    [CBTCommandTypes.CBT_SUBMIT_ANSWER]:          ['student', 'teacher', 'admin', 'principal_admin', 'super_admin'],
    [CBTCommandTypes.CBT_NEXT_QUESTION]:          ['student', 'teacher', 'admin', 'principal_admin', 'super_admin'],
    [CBTCommandTypes.CBT_PAUSE_SESSION]:          ['student', 'teacher', 'admin', 'principal_admin', 'super_admin'],
    [CBTCommandTypes.CBT_RESUME_SESSION]:         ['student', 'teacher', 'admin', 'principal_admin', 'super_admin'],
    [CBTCommandTypes.CBT_AUTO_SUBMIT]:            ['student', 'teacher', 'admin', 'principal_admin', 'super_admin'],
    [CBTCommandTypes.CBT_RESTORE_SESSION]:        ['student', 'teacher', 'admin', 'principal_admin', 'super_admin'],
    [CBTCommandTypes.CBT_SYNC_STATE]:             ['student', 'teacher', 'admin', 'principal_admin', 'super_admin'],

    // ── Teacher Review Domain ─────────────────────────────────────────────────
    // Phase E: Teacher reviews must be teacher or above — students cannot approve
    'TEACHER_REVIEW.CREATE':                      ['teacher', 'admin', 'principal_admin', 'super_admin'],
    'TEACHER_REVIEW.READ':                        ['authenticated', 'student', 'teacher', 'admin', 'principal_admin', 'examiner', 'super_admin'],
    'TEACHER_REVIEW.PENDING':                     ['teacher', 'admin', 'principal_admin', 'super_admin'],

    // ── Result Publication Domain ─────────────────────────────────────────────
    // Phase F: Only teachers and above can publish / unpublish results
    'RESULT.PUBLISH':                             ['teacher', 'admin', 'principal_admin', 'super_admin'],
    'RESULT.UNPUBLISH':                           ['admin', 'principal_admin', 'super_admin'],
};

export interface AuthGuardResult {
    allowed: boolean;
    reason?: string;
}

/**
 * Checks if a resolved identity is authorized to execute a given command.
 * Default = DENY. Unknown commands = BLOCKED.
 */
export function checkAuthGuard(
    commandType: string,
    identity: ResolvedIdentity,
    payload?: any
): AuthGuardResult {
    // 1. Check if command is registered in auth permission map
    const allowedRoles = PERMISSION_MAP[commandType];
    if (!allowedRoles) {
        return {
            allowed: false,
            reason: 'UNKNOWN_COMMAND'
        };
    }

    // 2. Check if the identity's role is in the allowed list
    if (!allowedRoles.includes(identity.role)) {
        return {
            allowed: false,
            reason: 'INSUFFICIENT_ROLE'
        };
    }

    // 3. Institution/School Firewall
    if (payload) {
        if (payload.institutionId && identity.institutionId && payload.institutionId !== identity.institutionId) {
            return { allowed: false, reason: 'CROSS_TENANT_VIOLATION' };
        }
        if (payload.schoolId && identity.schoolId && payload.schoolId !== identity.schoolId) {
            return { allowed: false, reason: 'CROSS_SCHOOL_VIOLATION' };
        }
    }

    return { allowed: true };
}

/**
 * Returns true if a command type is a known auth command.
 */
export function isAuthCommand(commandType: string): boolean {
    return Object.values(AUTH_COMMANDS).includes(commandType as AuthCommandType);
}

/**
 * Returns true if a command is allowed without authentication (public commands).
 */
export function isPublicCommand(commandType: string): boolean {
    const allowedRoles = PERMISSION_MAP[commandType];
    return !!allowedRoles && allowedRoles.includes('public');
}

