// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: studentService
// Manages student enrollment signals
// ──────────────────────────────────────────────

import { callRPC } from '../lib/rpcClient';
import { RPC_SIGNALS } from '../lib/rpcSignalRegistry';

export interface StudentPayload {
    p_first_name: string;
    p_last_name: string;
    p_gender: string;
    p_student_number: string;
    p_class_id: string;
    p_school_id: string;
    p_date_of_birth?: string;
}

export interface StudentResponse {
    success: boolean;
    student_id: string;
    student_number: string;
    error?: string;
}

export interface StudentSubjectsResponse {
    success: boolean;
    student_id: string;
    assigned_count: number;
    error?: string;
}

export interface BulkEnrollResponse {
    enrolled_count: number;
}

export const studentService = {
    /**
     * SIGNAL: ENROLL_STUDENT
     * Enrolls a single student via RPC.
     */
    enrollStudent: async (payload: StudentPayload): Promise<StudentResponse> => {
        return callRPC<StudentResponse>(
            RPC_SIGNALS.ENROLL_STUDENT,
            payload
        );
    },

    /**
     * SIGNAL: BULK_ENROLL_STUDENTS
     * Enrolls multiple students in a single atomic RPC call.
     */
    bulkEnrollStudents: async (students: any[], schoolId: string): Promise<BulkEnrollResponse> => {
        return callRPC<BulkEnrollResponse>(
            RPC_SIGNALS.BULK_ENROLL_STUDENTS,
            {
                p_students: students,
                p_school_id: schoolId
            }
        );
    },

    /**
     * SIGNAL: ENROLL_STUDENT_SUBJECTS
     * Enrolls a student into all subjects for their class.
     */
    enrollStudentSubjects: async (studentId: string): Promise<StudentSubjectsResponse> => {
        return callRPC<StudentSubjectsResponse>(
            RPC_SIGNALS.ENROLL_STUDENT_SUBJECTS,
            { p_student_id: studentId }
        );
    }
};
