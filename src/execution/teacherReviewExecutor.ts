// ────────────────────────────────────────────────────────────────────────────
// SEFAES NORTHSTAR MVP — TEACHER REVIEW EXECUTOR
// Phase E: Teacher review of AI-graded scripts.
// Implements TEACHER_REVIEW.CREATE, TEACHER_REVIEW.READ, TEACHER_REVIEW.PENDING,
// RESULT.PUBLISH, and RESULT.UNPUBLISH commands.
//
// Evidence: teacher_reviews table added via migration 002_teacher_reviews_and_publication.sql
// Evidence: exam_result_publications table added via same migration
// ────────────────────────────────────────────────────────────────────────────

import { db } from '../db/dbGateway';

export class TeacherReviewExecutor {
    async execute(type: string, payload: any, identity: any): Promise<any> {
        switch (type) {

            // ── TEACHER_REVIEW.CREATE ─────────────────────────────────────────
            // A teacher approves, rejects, or overrides a single AI-graded script.
            // The create_teacher_review RPC validates school ownership and
            // upserts on (script_id, teacher_id) conflict.
            case 'TEACHER_REVIEW.CREATE': {
                const { data, error } = await db.rpc('create_teacher_review', {
                    p_exam_id:        payload.examId,
                    p_script_id:      payload.scriptId,
                    p_teacher_id:     payload.teacherId,
                    p_school_id:      payload.schoolId,
                    p_status:         payload.status,
                    p_override_score: payload.overrideScore ?? null,
                    p_notes:          payload.notes ?? null
                });
                if (error) {
                    return { success: false, error: { message: error.message } };
                }
                if (data && !data.success) {
                    return { success: false, error: { message: data.error } };
                }
                return { success: true, data };
            }

            // ── TEACHER_REVIEW.READ ───────────────────────────────────────────
            // Returns all reviews for a given exam or school.
            case 'TEACHER_REVIEW.READ': {
                try {
                    const data = await db.select('teacher_reviews', (q) => {
                        let query = q.select(`
                            id, status, override_score, notes, reviewed_at, created_at,
                            exam_id,
                            script_id,
                            answer_scripts!script_id(
                                students!student_id(first_name, last_name)
                            ),
                            exams!exam_id(exam_title)
                        `)
                        .eq('school_id', payload.schoolId)
                        .order('created_at', { ascending: false });

                        if (payload.examId) {
                            query = query.eq('exam_id', payload.examId);
                        }
                        return query;
                    });
                    
                    return { success: true, data: data ?? [] };
                } catch (error: any) {
                    return { success: false, error: { message: error.message } };
                }
            }

            // ── TEACHER_REVIEW.PENDING ────────────────────────────────────────
            // Returns all reviews with status = 'pending' for a given teacher.
            // Called by TeacherTerminal to populate the review queue.
            case 'TEACHER_REVIEW.PENDING': {
                const { data, error } = await db.rpc('get_pending_reviews', {
                    p_teacher_id: payload.teacherId,
                    p_school_id:  payload.schoolId
                });
                if (error) {
                    return { success: false, error: { message: error.message } };
                }
                return { success: true, data: data ?? [] };
            }

            // ── RESULT.PUBLISH ────────────────────────────────────────────────
            // Marks results as visible to students and transitions exam to PUBLISHED.
            // The publish_exam_results RPC validates school ownership.
            // Advisory: warns if pending reviews remain (does not block publication).
            case 'RESULT.PUBLISH': {
                const { data, error } = await db.rpc('publish_exam_results', {
                    p_exam_id:   payload.examId,
                    p_school_id: payload.schoolId,
                    p_teacher_id: payload.teacherId,
                    p_notes:     payload.notes ?? null
                });
                if (error) {
                    return { success: false, error: { message: error.message } };
                }
                if (data && !data.success) {
                    return { success: false, error: { message: data.error } };
                }
                return { success: true, data };
            }

            // ── RESULT.UNPUBLISH ──────────────────────────────────────────────
            // Retracts publication — sets is_visible_to_students = FALSE.
            // Transitions exam back to APPROVED status.
            case 'RESULT.UNPUBLISH': {
                const { data, error } = await db.rpc('unpublish_exam_results', {
                    p_exam_id:   payload.examId,
                    p_school_id: payload.schoolId
                });
                if (error) {
                    return { success: false, error: { message: error.message } };
                }
                if (data && !data.success) {
                    return { success: false, error: { message: data.error } };
                }
                return { success: true, data };
            }

            default:
                return {
                    success: false,
                    error: { message: `[TeacherReviewExecutor] UNKNOWN_COMMAND: ${type}` }
                };
        }
    }
}
