// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: schoolService
// Manages school creation and settings signals
// ──────────────────────────────────────────────

import { callRPC, queryTable } from '../lib/rpcClient';
import { RPC_SIGNALS } from '../lib/rpcSignalRegistry';

export interface SchoolPayload {
    p_school_name: string;
    p_school_type: string;
    p_email: string;
    p_phone: string;
    p_address: string;
    p_logo_url?: string;
    p_principal_name?: string;
    p_vice_principal_name?: string;
    p_institution_id?: string;
}

export interface SchoolSettingsPayload {
    p_school_id: string;
    p_school_name?: string;
    p_address?: string;
    p_principal_name?: string;
    p_email?: string;
    p_phone?: string;
}

export interface SchoolResponse {
    id: string;
    school_name: string;
}

export const schoolService = {
    /**
     * SIGNAL: CREATE_SCHOOL_WITH_CLASSES
     * Creates a school and auto-initializes classes if Secondary.
     */
    createSchoolWithClasses: async (payload: SchoolPayload): Promise<SchoolResponse> => {
        return callRPC<SchoolResponse>(
            RPC_SIGNALS.CREATE_SCHOOL_WITH_CLASSES,
            payload
        );
    },

    /**
     * SIGNAL: UPDATE_SCHOOL_SETTINGS
     * Updates school profile fields via RPC.
     */
    updateSchoolSettings: async (payload: SchoolSettingsPayload): Promise<void> => {
        return callRPC<void>(
            RPC_SIGNALS.UPDATE_SCHOOL_SETTINGS,
            payload
        );
    },

    /**
     * QUERY: Fetch school data for display (read-only).
     */
    getSchoolProfile: async (schoolId: string) => {
        return queryTable('schools', (builder) =>
            builder.select('*').eq('id', schoolId).single()
        );
    },

    /**
     * QUERY: Fetch overall stats for a school (Principal Oversight).
     */
    getSchoolStats: async (schoolId: string) => {
        // Use queryTable for read-only aggregations
        const [students, teachers, exams, results] = await Promise.all([
            queryTable('students', (b) => b.select('id').eq('classes.school_id', schoolId)),
            queryTable('teachers', (b) => b.select('id').eq('school_id', schoolId)),
            queryTable('exams', (b) => b.select('id').eq('school_id', schoolId)),
            queryTable('grading_results', (b) => b.select('score').eq('answer_scripts.school_id', schoolId))
        ]);

        const scores = (results ?? []).map(r => Number(r.score));
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        return {
            totalStudents: students?.length ?? 0,
            totalTeachers: teachers?.length ?? 0,
            activeExams: exams?.length ?? 0,
            avgPerformance: Math.round(avg)
        };
    }
};
