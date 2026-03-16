// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: gradingService
// Manages all grading pipeline signals
// ──────────────────────────────────────────────

import { callRPC, queryTable } from '../lib/rpcClient';
import { RPC_SIGNALS } from '../lib/rpcSignalRegistry';
import { supabase } from '../lib/supabase';

export interface ExamPayload {
    p_exam_title: string;
    p_subject_id: string;
    p_class_id: string;
    p_exam_date: string;
    p_marking_scheme: any;
    p_school_id: string;
}

export interface AnswerScriptPayload {
    p_student_id: string;
    p_exam_id: string;
    p_teacher_id: string;
    p_school_id: string;
    p_ocr_text: string;
    p_file_url?: string;
}

export interface GradingResultPayload {
    p_script_id: string;
    p_score: number;
    p_feedback: string;
    p_confidence: number;
}

export const gradingService = {

    // ── COMMAND SIGNALS ─────────────────────────

    /**
     * SIGNAL: CREATE_EXAM
     * Creates an exam record via RPC.
     */
    createExam: async (payload: ExamPayload) => {
        return callRPC(RPC_SIGNALS.CREATE_EXAM, payload);
    },

    /**
     * SIGNAL: CREATE_ANSWER_SCRIPT
     * Uses RPC to insert into answer_scripts.
     * The database trigger queue_grading_job automatically creates the grading_job.
     */
    createAnswerScript: async (payload: AnswerScriptPayload) => {
        return callRPC<{ script_id: string; status: string }>(
            RPC_SIGNALS.CREATE_ANSWER_SCRIPT,
            payload
        );
    },

    // ── QUERY SIGNALS ───────────────────────────

    /**
     * QUERY SIGNAL: LOAD_EXAMS
     * Returns exams scoped to a school.
     */
    loadExams: async (school_id: string) => {
        return queryTable('exams', (builder) =>
            builder
                .select('id, exam_title, subject_id, class_id, exam_date, marking_scheme')
                .eq('school_id', school_id)
                .order('exam_date', { ascending: false })
        );
    },

    /**
     * QUERY SIGNAL: LOAD_STUDENTS
     * Returns students scoped to a school via class relationship.
     */
    loadStudents: async (school_id: string) => {
        return queryTable('students', (builder) =>
            builder
                .select('id, first_name, last_name, student_number, class_id, classes!inner(name, school_id)')
                .eq('classes.school_id', school_id)
        );
    },

    /**
     * QUERY SIGNAL: LOAD_GRADING_STATUS
     * Returns current grading pipeline state.
     */
    loadGradingStatus: async () => {
        const pendingScripts = await queryTable('answer_scripts', (builder) =>
            builder.select('id, grading_status').eq('grading_status', 'pending')
        );

        const activeJobs = await queryTable('grading_jobs', (builder) =>
            builder.select('id, status, script_id, attempts, processed_at').in('status', ['pending', 'processing'])
        );

        return { pendingScripts: pendingScripts ?? [], activeJobs: activeJobs ?? [] };
    },

    /**
     * QUERY SIGNAL: LOAD_GRADING_RESULTS
     * Returns completed grading results with student join.
     */
    loadGradingResults: async (scriptIds: string[]) => {
        return queryTable('grading_results', (builder) =>
            builder
                .select(`
                    id,
                    answer_script_id,
                    score,
                    ai_feedback,
                    confidence,
                    created_at,
                    answer_scripts!inner(
                        student_id,
                        exam_id,
                        students!inner(first_name, last_name)
                    )
                `)
                .in('answer_script_id', scriptIds)
        );
    },

    /**
     * QUERY SIGNAL: LOAD_ALL_GRADING_RESULTS
     * Returns all grading results for a school.
     */
    loadAllGradingResults: async (school_id: string) => {
        return queryTable('grading_results', (builder) =>
            builder
                .select(`
                    id,
                    score,
                    ai_feedback,
                    answer_scripts!inner(
                        id,
                        students!inner(
                            id,
                            first_name,
                            last_name,
                            class_id,
                            classes!inner(school_id)
                        ),
                        exams!inner(
                            id,
                            exam_title,
                            class_id
                        )
                    )
                `)
                .eq('answer_scripts.students.classes.school_id', school_id)
        );
    },

    /**
     * QUERY: Fetch pending scripts for an exam.
     */
    getPendingScripts: async (exam_id: string) => {
        return queryTable('answer_scripts', (builder) =>
            builder.select('id').eq('exam_id', exam_id).eq('grading_status', 'pending')
        );
    },

    /**
     * QUERY: Fetch insights for an exam.
     */
    getClassInsights: async (exam_id: string) => {
        return queryTable('class_insights', (builder) =>
            builder.select('*').eq('exam_id', exam_id).single()
        );
    },

    /**
     * QUERY SIGNAL: LOAD_PIPELINE_HEALTH
     * Returns aggregated pipeline statistics.
     */
    loadPipelineHealth: async () => {
        return queryTable('pipeline_health', (builder) =>
            builder.select('*').single()
        );
    },

    // ── WORKER SIGNALS ──────────────────────────

    /**
     * WORKER SIGNAL: START_AI_GRADING
     * Invokes the edge function to trigger the grading worker.
     */
    startAIGrading: async (exam_id?: string) => {
        const { data, error } = await supabase.functions.invoke('grade-script', {
            body: { exam_id: exam_id || null }
        });
        if (error) throw error;
        return data;
    },

    // ── EVENT SIGNALS ───────────────────────────

    /**
     * SIGNAL: FINALIZE_GRADING
     * Called by workers to complete grading.
     */
    finalizeGrading: async (payload: GradingResultPayload) => {
        return callRPC(RPC_SIGNALS.FINALIZE_GRADING, payload);
    }
};
