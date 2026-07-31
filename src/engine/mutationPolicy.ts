// ──────────────────────────────────────────────
// SEFAES MUTATION GUARD & DEV WATCHDOG
// Intercepts direct database mutations in Dev mode
// ──────────────────────────────────────────────

let isTransitioning = false;

const MUTATING_SIGNALS = [
    'create_institution_account',
    'create_school_with_classes',
    'update_school_settings',
    'initialize_secondary_classes',
    'create_class',
    'delete_class',
    'initialize_class_subjects',
    'create_subject_in_catalog',
    'assign_subject_to_class',
    'delete_subject_assignment',
    'create_teacher',
    'assign_teacher_to_subject',
    'enroll_student',
    'bulk_enroll_students',
    'enroll_student_subjects',
    'create_exam',
    'create_answer_script',
    'finalize_grading',
    'claim_grading_jobs',
    'reset_stuck_grading_jobs',
    'transition_cbt_session',
    'submit_cbt_exam'
];

export function enterTransition() {
    isTransitioning = true;
}

export function exitTransition() {
    isTransitioning = false;
}

export function checkMutationAllowed(functionName: string) {
    const isDev = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.DEV : (process.env.NODE_ENV !== 'production');
    if (isDev && MUTATING_SIGNALS.includes(functionName) && !isTransitioning) {
        throw new Error(`🚨 FSM VIOLATION DETECTED: Direct mutation attempted outside ExamEventEngine. (RPC: ${functionName})`);
    }
}
