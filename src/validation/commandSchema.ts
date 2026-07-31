// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 3 — COMMAND SCHEMA VALIDATION LAYER (ZOD)
// The absolute source of truth for command shapes.
// All commands MUST be registered and defined here.
// ────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';
import { COMMANDS } from '../lib/commandRegistry';

// ── Generic Command Structure ────────────────────────────────────────────────
// Every command hitting the server must conform to this outer envelope
export const CommandEnvelopeSchema = z.object({
    type: z.string(),
    payload: z.record(z.string(), z.any()),
    traceId: z.string().optional(),
    actorId: z.string().optional(),
    source: z.enum(['ui', 'system'] as [string, ...string[]]).default('ui'),
});

// ── Strict Payload Definitions per Command ───────────────────────────────────

const ClassesReadPayload = z.object({
    schoolId: z.string().uuid(),
});

const ClassesCreatePayload = z.object({
    name: z.string().min(2),
    schoolId: z.string().uuid(),
});

const ClassesDeletePayload = z.object({
    id: z.string().uuid(),
});

const SubjectsCreatePayload = z.object({
    name: z.string().min(2),
});

const ClassSubjectsCreatePayload = z.object({
    classId: z.string().uuid(),
    subjectId: z.string().uuid(),
    schoolId: z.string().uuid(),
});

const ClassSubjectsDeletePayload = z.object({
    id: z.string().uuid(),
});

const StudentsBulkCreatePayload = z.object({
    schoolId: z.string().uuid(),
    students: z.array(z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        classes_id: z.string().uuid().optional()
    })),
});

const ExamsCreatePayload = z.object({
    p_exam_title: z.string().min(3),
    p_subject_id: z.string().uuid(),
    p_class_id: z.string().uuid(),
    p_exam_date: z.string(),
    p_marking_scheme: z.any(),
    p_school_id: z.string().uuid(),
});

const StorageUploadPayload = z.object({
    fileName: z.string(),
    file: z.any(), // File object is hard to validate strictly in Zod if it crosses boundary as FormData
});

const GradingStartPayload = z.object({
    examId: z.string().uuid(),
});

const OcrProcessPayload = z.object({
    base64: z.string(),
});

// ── Auth Command Payloads ────────────────────────────────────────────────────

const AuthSignupSelfPayload = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    metadata: z.record(z.string(), z.any()).optional(),
});

const AuthSignInPayload = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const AuthSignOutPayload = z.object({});

const AuthCreateUserPayload = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.string().min(1),
});

const AuthDeleteUserPayload = z.object({
    userId: z.string().uuid(),
});

const AuthUpdateRolePayload = z.object({
    userId: z.string().uuid(),
    newRole: z.string().min(1),
});

const AuthGetSessionPayload = z.object({});
const AuthGetUserPayload = z.object({});

const AuthResetPasswordPayload = z.object({
    email: z.string().email(),
    redirectTo: z.string().url().optional(),
});

const AuthUpdatePasswordPayload = z.object({
    password: z.string().min(8),
});

// ── Registry Mapping ─────────────────────────────────────────────────────────

export const CommandPayloadSchemas: Record<string, z.ZodSchema<any>> = {
    // ── Student / Academic Commands ──────────────────────────────────────────
    [COMMANDS.CLASSES_READ]: ClassesReadPayload,
    [COMMANDS.CLASSES_CREATE]: ClassesCreatePayload,
    [COMMANDS.CLASSES_DELETE]: ClassesDeletePayload,
    
    [COMMANDS.SUBJECTS_READ]: z.object({}), // No payload needed
    [COMMANDS.SUBJECTS_CREATE]: SubjectsCreatePayload,
    
    [COMMANDS.CLASS_SUBJECTS_READ]: z.object({ schoolId: z.string().uuid() }),
    [COMMANDS.CLASS_SUBJECTS_CREATE]: ClassSubjectsCreatePayload,
    [COMMANDS.CLASS_SUBJECTS_DELETE]: ClassSubjectsDeletePayload,
    
    [COMMANDS.STUDENT_READ]: z.object({ schoolId: z.string().uuid() }),
    [COMMANDS.STUDENTS_BULK_CREATE]: StudentsBulkCreatePayload,
    [COMMANDS.STUDENT_ENROLL]: z.union([
        z.object({ schoolId: z.string().uuid(), students: z.array(z.any()) }),
        z.object({
            firstName: z.string().optional(),
            first_name: z.string().optional(),
            lastName: z.string().optional(),
            last_name: z.string().optional(),
            gender: z.string(),
            studentNumber: z.string().optional(),
            student_number: z.string().optional(),
            classId: z.string().uuid().optional(),
            class_id: z.string().uuid().optional(),
            schoolId: z.string().uuid(),
            dateOfBirth: z.string().optional(),
            date_of_birth: z.string().optional()
        })
    ]),
    [COMMANDS.STUDENT_DEACTIVATE]: z.object({ studentId: z.string() }),
    [COMMANDS.STUDENT_TRANSFER_CLASS]: z.object({
        studentId: z.string(),
        fromClassId: z.string().optional(),
        toClassId: z.string()
    }),

    [COMMANDS.EXAM_CREATE]: ExamsCreatePayload,
    [COMMANDS.EXAM_READ]: z.object({ schoolId: z.string().uuid() }),
    [COMMANDS.EXAM_READ_WITH_SCHEMES]: z.object({ schoolId: z.string().uuid() }),
    [COMMANDS.EXAM_TRANSITION_STATE]: z.object({
        examId: z.string().uuid(),
        fromState: z.string(),
        toState: z.string()
    }),

    // ── Result / AI Commands ─────────────────────────────────────────────────
    [COMMANDS.RESULT_READ]: z.object({ schoolId: z.string().uuid() }),
    [COMMANDS.RESULT_STATUS_READ]: z.object({}).optional(),
    [COMMANDS.RESULT_START_GRADING]: GradingStartPayload,
    [COMMANDS.STORAGE_UPLOAD]: StorageUploadPayload,
    [COMMANDS.ANSWER_SCRIPTS_CREATE]: z.record(z.string(), z.any()),
    [COMMANDS.OCR_PROCESS]: OcrProcessPayload,
    
    [COMMANDS.FINALIZE_GRADING]: z.object({
        jobId: z.string().uuid(),
        studentId: z.string().uuid(),
        examId: z.string().uuid(),
        score: z.number(),
        feedback: z.string(),
        gradingResults: z.any().optional()
    }),
    [COMMANDS.RETRY_GRADING]: z.object({
        jobId: z.string().uuid()
    }),
    [COMMANDS.GENERATE_INSIGHTS]: z.object({
        examId: z.string().uuid()
    }),
    [COMMANDS.RESULT_FAIL_GRADING]: z.object({
        jobId: z.string().uuid(),
        error: z.string()
    }),

    // ── CBT Commands ─────────────────────────────────────────────────────────
    [COMMANDS.CBT_START_SESSION]: z.object({
        examId: z.string().uuid(),
        studentId: z.string().uuid()
    }),
    [COMMANDS.CBT_LOAD_EXAM]: z.object({
        sessionId: z.string().uuid()
    }),
    [COMMANDS.CBT_BEGIN_EXAM]: z.object({
        sessionId: z.string().uuid()
    }),
    [COMMANDS.CBT_SUBMIT_ANSWER]: z.object({
        // B-07 FIX: Added attemptId — required by submit_cbt_answer(p_attempt_id)
        // Previously only sessionId was present, causing RPC parameter mismatch
        attemptId: z.string().uuid(),
        sessionId: z.string().uuid(),
        questionId: z.string().uuid(),
        optionId: z.string().uuid()
    }),
    [COMMANDS.CBT_NEXT_QUESTION]: z.object({
        sessionId: z.string().uuid()
    }),
    [COMMANDS.CBT_PAUSE_SESSION]: z.object({
        sessionId: z.string().uuid()
    }),
    [COMMANDS.CBT_RESUME_SESSION]: z.object({
        sessionId: z.string().uuid()
    }),
    [COMMANDS.CBT_AUTO_SUBMIT]: z.object({
        // B-07 FIX: Added attemptId for score finalization on cbt_attempts table
        sessionId: z.string().uuid(),
        attemptId: z.string().uuid().optional()
    }),
    [COMMANDS.CBT_RESTORE_SESSION]: z.object({
        sessionId: z.string().uuid()
    }),
    [COMMANDS.CBT_SYNC_STATE]: z.object({
        sessionId: z.string().uuid(),
        state: z.string(),
        currentQuestion: z.number().int().nonnegative(),
        remainingTime: z.number().int()
    }),

    // ── Auth Commands ────────────────────────────────────────────────────────
    [COMMANDS.IDENTITY_RESOLVE_TEACHER]: z.object({}),
    [COMMANDS.AUTH_SIGNUP_SELF]: AuthSignupSelfPayload,
    [COMMANDS.AUTH_SIGN_IN]: AuthSignInPayload,
    [COMMANDS.AUTH_SIGN_IN_ANONYMOUS]: z.object({}),
    [COMMANDS.AUTH_SIGN_OUT]: AuthSignOutPayload,
    [COMMANDS.AUTH_CREATE_USER]: AuthCreateUserPayload,
    [COMMANDS.AUTH_DELETE_USER]: AuthDeleteUserPayload,
    [COMMANDS.AUTH_UPDATE_ROLE]: AuthUpdateRolePayload,
    [COMMANDS.AUTH_GET_SESSION]: AuthGetSessionPayload,
    [COMMANDS.AUTH_GET_USER]: AuthGetUserPayload,
    [COMMANDS.AUTH_RESET_PASSWORD]: AuthResetPasswordPayload,
    [COMMANDS.AUTH_UPDATE_PASSWORD]: AuthUpdatePasswordPayload,

    // ── Teacher Review Commands ───────────────────────────────────────────────
    [COMMANDS.TEACHER_REVIEW_CREATE]: z.object({
        examId:        z.string().uuid(),
        scriptId:      z.string().uuid(),
        teacherId:     z.string().uuid(),
        schoolId:      z.string().uuid(),
        status:        z.enum(['pending', 'approved', 'rejected', 'override']),
        overrideScore: z.number().min(0).max(100).optional(),
        notes:         z.string().max(2000).optional()
    }),
    [COMMANDS.TEACHER_REVIEW_READ]: z.object({
        examId:    z.string().uuid().optional(),
        schoolId:  z.string().uuid()
    }),
    [COMMANDS.TEACHER_REVIEW_PENDING]: z.object({
        teacherId: z.string().uuid(),
        schoolId:  z.string().uuid()
    }),

    // ── Result Publication Commands ───────────────────────────────────────────
    [COMMANDS.RESULT_PUBLISH]: z.object({
        examId:    z.string().uuid(),
        schoolId:  z.string().uuid(),
        teacherId: z.string().uuid(),
        notes:     z.string().max(1000).optional()
    }),
    [COMMANDS.RESULT_UNPUBLISH]: z.object({
        examId:   z.string().uuid(),
        schoolId: z.string().uuid()
    }),
};

/**
 * Validates a command object against its strict Zod schema.
 * Throws ZodError if invalid, which will be caught by ErrorTaxonomy.
 */
export function validateCommandSchema(commandType: string, payload: unknown) {
    const schema = CommandPayloadSchemas[commandType];
    if (!schema) {
        throw new Error(`COMMAND_NOT_REGISTERED: ${commandType}`);
    }
    
    // Strict parsing (throws on failure)
    return schema.parse(payload);
}

