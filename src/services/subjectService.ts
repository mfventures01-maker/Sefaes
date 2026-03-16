// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: subjectService
// Manages subject catalog and class-subject mapping signals
// ──────────────────────────────────────────────

import { callRPC, queryTable } from '../lib/rpcClient';
import { RPC_SIGNALS } from '../lib/rpcSignalRegistry';

export interface SubjectCatalogResponse {
    id: string;
    name: string;
    category: string | null;
}

export interface ClassSubjectResponse {
    id: string;
    class_id: string;
    subject_id: string;
    school_id: string;
    classes?: { name: string; school_id: string };
    subject_catalog?: { name: string };
}

export const subjectService = {
    /**
     * SIGNAL: INITIALIZE_CLASS_SUBJECTS
     * Maps all subjects from catalog to all classes for a school.
     */
    initializeClassSubjects: async (schoolId: string): Promise<void> => {
        return callRPC<void>(
            RPC_SIGNALS.INITIALIZE_CLASS_SUBJECTS,
            { p_school_id: schoolId }
        );
    },

    /**
     * SIGNAL: CREATE_SUBJECT_IN_CATALOG
     * Adds a new subject to the global catalog.
     */
    createSubjectInCatalog: async (name: string, category?: string): Promise<SubjectCatalogResponse> => {
        return callRPC<SubjectCatalogResponse>(
            RPC_SIGNALS.CREATE_SUBJECT_IN_CATALOG,
            { p_name: name, p_category: category || null }
        );
    },

    /**
     * SIGNAL: ASSIGN_SUBJECT_TO_CLASS
     * Assigns a catalog subject to a specific class within a school.
     */
    assignSubjectToClass: async (classId: string, subjectId: string, schoolId: string): Promise<ClassSubjectResponse> => {
        return callRPC<ClassSubjectResponse>(
            RPC_SIGNALS.ASSIGN_SUBJECT_TO_CLASS,
            { p_class_id: classId, p_subject_id: subjectId, p_school_id: schoolId }
        );
    },

    /**
     * SIGNAL: DELETE_SUBJECT_ASSIGNMENT
     * Removes a class-subject mapping.
     */
    deleteSubjectAssignment: async (assignmentId: string): Promise<void> => {
        return callRPC<void>(
            RPC_SIGNALS.DELETE_SUBJECT_ASSIGNMENT,
            { p_assignment_id: assignmentId }
        );
    },

    /**
     * QUERY: Fetch class-subject mappings with joins (read-only).
     */
    getClassSubjects: async (schoolId: string): Promise<ClassSubjectResponse[]> => {
        return queryTable<ClassSubjectResponse[]>('class_subjects', (builder) =>
            builder
                .select(`
                    id,
                    class_id,
                    classes!inner(name, school_id),
                    subject_id,
                    subject_catalog!inner(name)
                `)
                .eq('classes.school_id', schoolId)
        );
    },

    /**
     * QUERY: Fetch all subjects from catalog (read-only).
     */
    getSubjectCatalog: async (): Promise<SubjectCatalogResponse[]> => {
        return queryTable<SubjectCatalogResponse[]>('subject_catalog', (builder) =>
            builder.select('*').order('name')
        );
    }
};
