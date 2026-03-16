import { supabase } from '../lib/supabase';

// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: gradingService
// Manages all grading pipeline signals
// ──────────────────────────────────────────────

export interface ExamPayload {
    exam_title: string;
    subject_id: string;
    class_id: string;
    exam_date: string;
    marking_scheme: any;
    school_id: string;
}

export interface AnswerScriptPayload {
    student_id: string;
    exam_id: string;
    teacher_id: string;
    school_id: string;
    ocr_text: string;
    file_url?: string;
}

export interface GradingResultPayload {
    script_id: string;
    score: number;
    feedback: string;
    confidence: number;
}

export const gradingService = {

    // ── COMMAND SIGNALS ─────────────────────────

    /**
     * COMMAND SIGNAL: CREATE_EXAM
     * Creates an exam record in the exams table.
     */
    createExam: async (payload: ExamPayload) => {
        const { data, error } = await supabase
            .from('exams')
            .insert({
                exam_title: payload.exam_title,
                subject_id: payload.subject_id,
                class_id: payload.class_id,
                exam_date: payload.exam_date,
                marking_scheme: payload.marking_scheme,
                school_id: payload.school_id
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * COMMAND SIGNAL: CREATE_ANSWER_SCRIPT (UPLOAD_SCRIPT)
     * Uses RPC create_answer_script to insert into answer_scripts.
     * The database trigger queue_grading_job automatically creates the grading_job.
     */
    createAnswerScript: async (payload: AnswerScriptPayload) => {
        const { data, error } = await supabase.rpc('create_answer_script', {
            p_student_id: payload.student_id,
            p_exam_id: payload.exam_id,
            p_teacher_id: payload.teacher_id,
            p_school_id: payload.school_id,
            p_ocr_text: payload.ocr_text,
            p_file_url: payload.file_url
        });
        if (error) throw error;
        return data as { script_id: string; status: string };
    },

    // ── QUERY SIGNALS ───────────────────────────

    /**
     * QUERY SIGNAL: LOAD_EXAMS
     * Returns exams scoped to a school.
     */
    loadExams: async (school_id: string) => {
        const { data, error } = await supabase
            .from('exams')
            .select('id, exam_title, subject_id, class_id, exam_date, marking_scheme')
            .eq('school_id', school_id)
            .order('exam_date', { ascending: false });
        if (error) throw error;
        return data;
    },

    /**
     * QUERY SIGNAL: LOAD_STUDENTS
     * Returns students scoped to a school via class relationship.
     */
    loadStudents: async (school_id: string) => {
        const { data, error } = await supabase
            .from('students')
            .select('id, first_name, last_name, student_number, class_id, classes!inner(name, school_id)')
            .eq('classes.school_id', school_id);
        if (error) throw error;
        return data;
    },

    /**
     * QUERY SIGNAL: LOAD_GRADING_STATUS
     * Returns current grading pipeline state.
     */
    loadGradingStatus: async () => {
        const { data: pendingScripts, error: pendingError } = await supabase
            .from('answer_scripts')
            .select('id, grading_status')
            .eq('grading_status', 'pending');
        if (pendingError) throw pendingError;

        const { data: activeJobs, error: jobsError } = await supabase
            .from('grading_jobs')
            .select('id, status, script_id, attempts, processed_at')
            .in('status', ['pending', 'processing']);
        if (jobsError) throw jobsError;

        return { pendingScripts: pendingScripts ?? [], activeJobs: activeJobs ?? [] };
    },

    /**
     * QUERY SIGNAL: LOAD_GRADING_RESULTS
     * Returns completed grading results with student join.
     */
    loadGradingResults: async (scriptIds: string[]) => {
        const { data, error } = await supabase
            .from('grading_results')
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
            .in('answer_script_id', scriptIds);
        if (error) throw error;
        return data;
    },

    /**
     * QUERY SIGNAL: LOAD_PIPELINE_HEALTH
     * Returns aggregated pipeline statistics.
     */
    loadPipelineHealth: async () => {
        const { data, error } = await supabase
            .from('pipeline_health')
            .select('*')
            .single();
        if (error) throw error;
        return data;
    },

    // ── WORKER SIGNALS ──────────────────────────

    /**
     * WORKER SIGNAL: START_AI_GRADING
     * Invokes the edge function to trigger the grading worker.
     * The trigger on answer_scripts already queued the jobs.
     */
    startAIGrading: async (exam_id?: string) => {
        const { data, error } = await supabase.functions.invoke('grade-script', {
            body: { exam_id: exam_id || null }
        });
        if (error) throw error;
        return data;
    },

    // ── EVENT SIGNALS (frontend observation only) ─

    /**
     * EVENT SIGNAL: FINALIZE_GRADING
     * Called by workers, NOT by the frontend directly.
     * Exposed here for admin/debug tooling only.
     */
    finalizeGrading: async (payload: GradingResultPayload) => {
        const { data, error } = await supabase.rpc('finalize_grading', {
            p_script_id: payload.script_id,
            p_score: payload.score,
            p_feedback: payload.feedback,
            p_confidence: payload.confidence
        });
        if (error) throw error;
        return data;
    }
};
