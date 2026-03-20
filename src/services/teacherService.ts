// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: teacherService
// Manages teacher creation and assignment signals
// ──────────────────────────────────────────────

import { callRPC } from '../lib/rpcClient';
import { RPC_SIGNALS } from '../lib/rpcSignalRegistry';

export interface TeacherPayload {
    p_name: string;
    p_email: string;
    p_phone: string;
    p_school_id: string;
    p_class_subject_id?: string | null;
}

export interface TeacherResponse {
    success: boolean;
    teacher_id: string;
    assignment_created: boolean;
    error?: string;
}

export interface TeacherAssignmentResponse {
    id: string;
    teacher_id: string;
    class_subject_id: string;
}

export const teacherService = {
    /**
     * SIGNAL: CREATE_TEACHER
     * Creates a teacher record for a school.
     */
    createTeacher: async (payload: TeacherPayload): Promise<TeacherResponse> => {
        return callRPC<TeacherResponse>(
            RPC_SIGNALS.CREATE_TEACHER,
            payload
        );
    },

    /**
     * SIGNAL: ASSIGN_TEACHER_TO_SUBJECT
     * Assigns a teacher to a class-subject mapping.
     */
    assignTeacherToSubject: async (teacherId: string, classSubjectId: string): Promise<TeacherAssignmentResponse> => {
        return callRPC<TeacherAssignmentResponse>(
            RPC_SIGNALS.ASSIGN_TEACHER_TO_SUBJECT,
            { p_teacher_id: teacherId, p_class_subject_id: classSubjectId }
        );
    }
};
