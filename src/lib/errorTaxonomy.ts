// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 2.1 — GLOBAL ERROR TAXONOMY
// Every error in the system is classified here.
// No raw errors reach the UI. Ever.
// ────────────────────────────────────────────────────────────────────────────

export const ERROR_CODES = {
    // ── Registry ──────────────────────────────────────────────────────────────
    COMMAND_NOT_REGISTERED:   'COMMAND_NOT_REGISTERED',
    INVALID_PAYLOAD:          'INVALID_PAYLOAD',

    // ── State Machine ─────────────────────────────────────────────────────────
    STATE_TRANSITION_INVALID: 'STATE_TRANSITION_INVALID',
    EXAM_NOT_FOUND:           'EXAM_NOT_FOUND',
    STUDENT_NOT_ENROLLED:     'STUDENT_NOT_ENROLLED',

    // ── Pipeline ──────────────────────────────────────────────────────────────
    QUEUE_FAILURE:            'QUEUE_FAILURE',
    QUEUE_MAX_RETRIES:        'QUEUE_MAX_RETRIES',
    SCRIPT_JOB_NOT_FOUND:     'SCRIPT_JOB_NOT_FOUND',

    // ── OCR ───────────────────────────────────────────────────────────────────
    OCR_TIMEOUT:              'OCR_TIMEOUT',
    OCR_FAILED:               'OCR_FAILED',

    // ── Grading ───────────────────────────────────────────────────────────────
    GRADING_FAILED:           'GRADING_FAILED',

    // ── Storage ───────────────────────────────────────────────────────────────
    STORAGE_UPLOAD_FAILED:    'STORAGE_UPLOAD_FAILED',

    // ── Identity / Auth ───────────────────────────────────────────────────────
    AUTH_FAILURE:             'AUTH_FAILURE',
    MISSING_IDENTITY:         'MISSING_IDENTITY',

    // ── Generic ───────────────────────────────────────────────────────────────
    UNKNOWN:                  'UNKNOWN',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export type StructuredError = {
    code: ErrorCode;
    message: string;      // User-safe, human-readable
    traceId: string;
    recoverable: boolean; // If true, UI should offer retry
};

// ── Raw → Structured Translation Table ───────────────────────────────────────
const TRANSLATIONS: Array<{ pattern: RegExp | string; code: ErrorCode; message: string; recoverable: boolean }> = [
    {
        pattern: 'COMMAND_NOT_REGISTERED',
        code: ERROR_CODES.COMMAND_NOT_REGISTERED,
        message: 'An unrecognized operation was attempted. Please contact support.',
        recoverable: false
    },
    {
        pattern: 'INVALID_STATE_TRANSITION',
        code: ERROR_CODES.STATE_TRANSITION_INVALID,
        message: 'This action cannot be performed in the current system state.',
        recoverable: false
    },
    {
        pattern: 'EXAM_NOT_FOUND',
        code: ERROR_CODES.EXAM_NOT_FOUND,
        message: 'The selected exam could not be found. Please refresh and try again.',
        recoverable: true
    },
    {
        pattern: 'STUDENT_NOT_ENROLLED',
        code: ERROR_CODES.STUDENT_NOT_ENROLLED,
        message: 'This student is not enrolled in the selected class or exam.',
        recoverable: false
    },
    {
        pattern: /ocr|vision|gemini/i,
        code: ERROR_CODES.OCR_FAILED,
        message: 'Handwriting recognition failed. Please ensure the image is clear and try again.',
        recoverable: true
    },
    {
        pattern: /upload|storage/i,
        code: ERROR_CODES.STORAGE_UPLOAD_FAILED,
        message: 'File upload failed. Please check your connection and try again.',
        recoverable: true
    },
    {
        pattern: /grading|finalize/i,
        code: ERROR_CODES.GRADING_FAILED,
        message: 'AI grading failed. The script has been queued for retry.',
        recoverable: true
    },
    {
        pattern: /auth|login|session|identity/i,
        code: ERROR_CODES.AUTH_FAILURE,
        message: 'Your session is invalid. Please log out and sign in again.',
        recoverable: false
    },
    {
        pattern: /max.retries|queue/i,
        code: ERROR_CODES.QUEUE_MAX_RETRIES,
        message: 'Operation failed after multiple attempts. Please try again later.',
        recoverable: true
    },
];

/**
 * Converts any raw error into a fully structured, user-safe StructuredError.
 * Never exposes stack traces, internal IDs, or Supabase details.
 */
export function classifyError(err: unknown, traceId: string): StructuredError {
    const raw = err instanceof Error ? err.message : String(err ?? 'Unknown error');

    for (const rule of TRANSLATIONS) {
        const matches =
            typeof rule.pattern === 'string'
                ? raw.includes(rule.pattern)
                : rule.pattern.test(raw);

        if (matches) {
            return {
                code: rule.code,
                message: `${rule.message} (Ref: ${traceId})`,
                traceId,
                recoverable: rule.recoverable,
            };
        }
    }

    return {
        code: ERROR_CODES.UNKNOWN,
        message: `An unexpected error occurred. Reference: ${traceId}`,
        traceId,
        recoverable: true,
    };
}
