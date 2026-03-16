// ──────────────────────────────────────────────
// SEFAES RPC SIGNAL REGISTRY
// Master registry of all permitted backend signals
// Prevents silent communication errors
// ──────────────────────────────────────────────

/**
 * Every RPC function the frontend is allowed to call.
 * If a signal is not listed here, it does not exist.
 */
export const RPC_SIGNALS = {
    // Identity & Auth
    RESOLVE_TEACHER_IDENTITY: 'resolve_teacher_identity',

    // Institution
    CREATE_INSTITUTION_ACCOUNT: 'create_institution_account',

    // School
    CREATE_SCHOOL_WITH_CLASSES: 'create_school_with_classes',
    UPDATE_SCHOOL_SETTINGS: 'update_school_settings',

    // Classes
    INITIALIZE_SECONDARY_CLASSES: 'initialize_secondary_classes',
    CREATE_CLASS: 'create_class',
    DELETE_CLASS: 'delete_class',

    // Subjects
    INITIALIZE_CLASS_SUBJECTS: 'initialize_class_subjects',
    CREATE_SUBJECT_IN_CATALOG: 'create_subject_in_catalog',
    ASSIGN_SUBJECT_TO_CLASS: 'assign_subject_to_class',
    DELETE_SUBJECT_ASSIGNMENT: 'delete_subject_assignment',

    // Teachers
    CREATE_TEACHER: 'create_teacher',
    ASSIGN_TEACHER_TO_SUBJECT: 'assign_teacher_to_subject',

    // Students
    ENROLL_STUDENT: 'enroll_student',
    BULK_ENROLL_STUDENTS: 'bulk_enroll_students',
    ENROLL_STUDENT_SUBJECTS: 'enroll_student_subjects',

    // Grading Pipeline
    CREATE_EXAM: 'create_exam',
    CREATE_ANSWER_SCRIPT: 'create_answer_script',
    FINALIZE_GRADING: 'finalize_grading',
    CLAIM_GRADING_JOBS: 'claim_grading_jobs',
    RESET_STUCK_GRADING_JOBS: 'reset_stuck_grading_jobs',
} as const;

export type RPCSignalName = typeof RPC_SIGNALS[keyof typeof RPC_SIGNALS];
