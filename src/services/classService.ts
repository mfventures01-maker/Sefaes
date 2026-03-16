// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: classService
// Manages class initialization and CRUD signals
// ──────────────────────────────────────────────

import { callRPC, queryTable } from '../lib/rpcClient';
import { RPC_SIGNALS } from '../lib/rpcSignalRegistry';

export interface ClassResponse {
    id: string;
    name: string;
    school_id: string;
    created_at: string;
}

export const classService = {
    /**
     * SIGNAL: INITIALIZE_SECONDARY_CLASSES
     * Creates the JSS1-SS3 academic ladder for a school.
     */
    initializeSecondaryClasses: async (schoolId: string): Promise<void> => {
        return callRPC<void>(
            RPC_SIGNALS.INITIALIZE_SECONDARY_CLASSES,
            { p_school_id: schoolId }
        );
    },

    /**
     * SIGNAL: CREATE_CLASS
     * Creates a single class for a school.
     */
    createClass: async (name: string, schoolId: string): Promise<ClassResponse> => {
        return callRPC<ClassResponse>(
            RPC_SIGNALS.CREATE_CLASS,
            { p_name: name, p_school_id: schoolId }
        );
    },

    /**
     * SIGNAL: DELETE_CLASS
     * Removes a class by ID.
     */
    deleteClass: async (classId: string): Promise<void> => {
        return callRPC<void>(
            RPC_SIGNALS.DELETE_CLASS,
            { p_class_id: classId }
        );
    },

    /**
     * QUERY: Fetch all classes for a school (read-only).
     */
    getClasses: async (schoolId: string): Promise<ClassResponse[]> => {
        return queryTable<ClassResponse[]>('classes', (builder) =>
            builder.select('*').eq('school_id', schoolId).order('name')
        );
    }
};
