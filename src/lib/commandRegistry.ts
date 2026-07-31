// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 2 — COMMAND REGISTRY (THE LAW BOOK)
// Any command NOT listed here is REJECTED immediately.
// No dynamic string execution. No fallback behavior. No exceptions.
// ────────────────────────────────────────────────────────────────────────────

export const COMMANDS = {
    // ── Auth Commands ────────────────────────────────────────────────────────
    AUTH_SIGNUP_SELF:           'AUTH.SIGNUP_SELF',
    AUTH_SIGN_IN:              'AUTH.SIGN_IN',
    AUTH_SIGN_IN_ANONYMOUS:    'AUTH.SIGN_IN_ANONYMOUS',
    AUTH_SIGN_OUT:             'AUTH.SIGN_OUT',
    AUTH_CREATE_USER:          'AUTH.CREATE_USER',
    AUTH_DELETE_USER:          'AUTH.DELETE_USER',
    AUTH_UPDATE_ROLE:          'AUTH.UPDATE_ROLE',
    AUTH_GET_SESSION:          'AUTH.GET_SESSION',
    AUTH_GET_USER:             'AUTH.GET_USER',
    IDENTITY_RESOLVE_TEACHER:  'AUTH.IDENTITY_RESOLVE_TEACHER',
    AUTH_RESET_PASSWORD:       'AUTH.RESET_PASSWORD',
    AUTH_UPDATE_PASSWORD:      'AUTH.UPDATE_PASSWORD',

    // ── Student / Academic Commands ──────────────────────────────────────────
    STUDENT_ENROLL:            'STUDENT.ENROLL',
    STUDENT_DEACTIVATE:        'STUDENT.DEACTIVATE',
    STUDENT_TRANSFER_CLASS:    'STUDENT.TRANSFER_CLASS',
    STUDENT_READ:              'STUDENT.READ',
    STUDENTS_READ:             'STUDENT.READ',
    STUDENTS_BULK_CREATE:      'STUDENT.BULK_CREATE',

    CLASSES_READ:              'STUDENT.CLASSES_READ',
    CLASSES_CREATE:            'STUDENT.CLASSES_CREATE',
    CLASSES_DELETE:            'STUDENT.CLASSES_DELETE',

    SUBJECTS_READ:             'STUDENT.SUBJECTS_READ',
    SUBJECTS_CREATE:           'STUDENT.SUBJECTS_CREATE',

    CLASS_SUBJECTS_READ:       'STUDENT.CLASS_SUBJECTS_READ',
    CLASS_SUBJECTS_CREATE:     'STUDENT.CLASS_SUBJECTS_CREATE',
    CLASS_SUBJECTS_DELETE:     'STUDENT.CLASS_SUBJECTS_DELETE',

    // ── Exam Commands ────────────────────────────────────────────────────────
    EXAM_CREATE:               'EXAM.CREATE',
    EXAM_READ:                 'EXAM.READ',
    EXAM_READ_WITH_SCHEMES:    'EXAM.READ_WITH_SCHEMES',
    EXAMS_CREATE:              'EXAM.CREATE',
    EXAMS_READ:                'EXAM.READ',
    EXAMS_WITH_SCHEMES_READ:   'EXAM.READ_WITH_SCHEMES',
    EXAM_TRANSITION_STATE:     'EXAM.TRANSITION_STATE',

    // ── Result / AI Commands ─────────────────────────────────────────────────
    RESULT_READ:               'RESULT.READ',
    RESULT_STATUS_READ:        'RESULT.STATUS_READ',
    RESULT_START_GRADING:      'RESULT.START_GRADING',
    GRADING_RESULTS_READ:      'RESULT.READ',
    GRADING_STATUS_READ:       'RESULT.STATUS_READ',
    GRADING_START:             'RESULT.START_GRADING',
    STORAGE_UPLOAD:            'RESULT.STORAGE_UPLOAD',
    ANSWER_SCRIPTS_CREATE:     'RESULT.ANSWER_SCRIPT_CREATE',
    OCR_PROCESS:               'RESULT.OCR_PROCESS',
    FINALIZE_GRADING:          'RESULT.FINALIZE_GRADING',
    RETRY_GRADING:             'RESULT.RETRY_GRADING',
    GENERATE_INSIGHTS:         'RESULT.GENERATE_INSIGHTS',
    RESULT_FAIL_GRADING:       'RESULT.FAIL_GRADING',

    // ── CBT Commands ─────────────────────────────────────────────────────────
    CBT_START_SESSION:         'CBT.START_SESSION',
    CBT_LOAD_EXAM:             'CBT.LOAD_EXAM',
    CBT_BEGIN_EXAM:            'CBT.BEGIN_EXAM',
    CBT_SUBMIT_ANSWER:         'CBT.SUBMIT_ANSWER',
    CBT_NEXT_QUESTION:         'CBT.NEXT_QUESTION',
    CBT_PAUSE_SESSION:         'CBT.PAUSE_SESSION',
    CBT_RESUME_SESSION:        'CBT.RESUME_SESSION',
    CBT_AUTO_SUBMIT:           'CBT.AUTO_SUBMIT',
    CBT_RESTORE_SESSION:       'CBT.RESTORE_SESSION',
    CBT_SYNC_STATE:            'CBT.SYNC_STATE',

    // ── Teacher Review Commands ───────────────────────────────────────────────
    // Phase E: Teacher reviews AI-graded scripts before publication
    TEACHER_REVIEW_CREATE:     'TEACHER_REVIEW.CREATE',
    TEACHER_REVIEW_READ:       'TEACHER_REVIEW.READ',
    TEACHER_REVIEW_PENDING:    'TEACHER_REVIEW.PENDING',

    // ── Result Publication Commands ───────────────────────────────────────────
    // Phase F: Publish / unpublish results to make them visible to students
    RESULT_PUBLISH:            'RESULT.PUBLISH',
    RESULT_UNPUBLISH:          'RESULT.UNPUBLISH',
} as const;

export type CommandType = typeof COMMANDS[keyof typeof COMMANDS];

/** The complete set of valid command type strings as a Set for O(1) lookup */
const VALID_COMMANDS: ReadonlySet<string> = new Set(Object.values(COMMANDS));

/**
 * Validates that a command type is registered.
 * Throws immediately if not found — no fallback, no silence.
 */
export function assertCommandRegistered(type: string): asserts type is CommandType {
    if (!VALID_COMMANDS.has(type)) {
        throw new Error(
            `COMMAND_NOT_REGISTERED: "${type}" is not in the SEFAES command registry. ` +
            `Permitted commands: ${[...VALID_COMMANDS].join(', ')}`
        );
    }
}

