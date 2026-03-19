// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: onboardingService (REFACTORED)
//
// This service is now a THIN ORCHESTRATION LAYER
// that delegates all mutations to domain-specific
// RPC services. No direct table access permitted.
// ──────────────────────────────────────────────

import { queryTable } from '../lib/rpcClient';
import { institutionService, InstitutionPayload } from './institutionService';
import { schoolService, SchoolPayload } from './schoolService';
import { classService } from './classService';
import { subjectService } from './subjectService';
import { teacherService } from './teacherService';
import { studentService } from './studentService';

// Re-export types for backward compat
export type { InstitutionPayload } from './institutionService';

export interface SchoolFormPayload {
    institution_id: string;
    school_name: string;
    school_type: 'Secondary' | 'Primary';
    address: string;
    email?: string;
    phone?: string;
    logo_url?: string;
    principal_name?: string;
    vice_principal_name?: string;
}

export interface TeacherFormPayload {
    school_id: string;
    name: string;
    email: string;
    phone: string;
    class_subject_id?: string;
}

export interface StudentFormPayload {
    first_name: string;
    last_name: string;
    gender: string;
    student_number: string;
    class_id: string;
    school_id?: string;
    date_of_birth?: string;
}

export const onboardingService = {
    // ── STAGE 1: Institution ────────────────────
    createInstitutionAccount: async (payload: InstitutionPayload) => {
        return institutionService.createInstitutionAccount(payload);
    },

    // ── STAGE 2: School ─────────────────────────
    createSchool: async (payload: SchoolFormPayload) => {
        return schoolService.createSchoolWithClasses({
            p_school_name: payload.school_name,
            p_school_type: payload.school_type,
            p_email: payload.email || '',
            p_phone: payload.phone || '',
            p_address: payload.address,
            p_logo_url: payload.logo_url || '',
            p_principal_name: payload.principal_name || '',
            p_vice_principal_name: payload.vice_principal_name || '',
            p_institution_id: payload.institution_id
        });
    },

    updateSchoolSettings: async (schoolId: string, formData: {
        school_name?: string;
        address?: string;
        principal_name?: string;
        email?: string;
        phone?: string;
    }) => {
        return schoolService.updateSchoolSettings({
            p_school_id: schoolId,
            p_school_name: formData.school_name,
            p_address: formData.address,
            p_principal_name: formData.principal_name,
            p_email: formData.email,
            p_phone: formData.phone
        });
    },

    // ── STAGE 3: Classes ────────────────────────
    initializeSecondaryClasses: async (schoolId: string) => {
        return classService.initializeSecondaryClasses(schoolId);
    },

    createClass: async (payload: { name: string; school_id: string }) => {
        return classService.createClass(payload.name, payload.school_id);
    },

    deleteClass: async (classId: string) => {
        return classService.deleteClass(classId);
    },

    // ── STAGE 4: Subjects ───────────────────────
    initializeClassSubjects: async (schoolId: string) => {
        return subjectService.initializeClassSubjects(schoolId);
    },

    createSubjectInCatalog: async (name: string, category?: string) => {
        return subjectService.createSubjectInCatalog(name, category);
    },

    assignSubjectToClass: async (classId: string, subjectId: string, schoolId: string) => {
        return subjectService.assignSubjectToClass(classId, subjectId, schoolId);
    },

    deleteSubjectAssignment: async (assignmentId: string) => {
        return subjectService.deleteSubjectAssignment(assignmentId);
    },

    // ── STAGE 5: Teachers ───────────────────────
    createTeacher: async (payload: TeacherFormPayload) => {
        return teacherService.createTeacher({
            p_name: payload.name,
            p_email: payload.email,
            p_phone: payload.phone,
            p_school_id: payload.school_id,
            p_class_subject_id: payload.class_subject_id || null
        });
    },

    assignTeacherToSubject: async (teacherId: string, classSubjectId: string) => {
        return teacherService.assignTeacherToSubject(teacherId, classSubjectId);
    },

    enrollStudent: async (payload: StudentFormPayload) => {
        return studentService.enrollStudent({
            p_first_name: payload.first_name,
            p_last_name: payload.last_name,
            p_gender: payload.gender,
            p_student_number: payload.student_number,
            p_class_id: payload.class_id,
            p_school_id: payload.school_id as string,
            p_date_of_birth: payload.date_of_birth || undefined
        });
    },

    bulkEnrollStudents: async (rows: any[], schoolId: string) => {
        return studentService.bulkEnrollStudents(rows, schoolId);
    },

    enrollStudentSubjects: async (studentId: string) => {
        return studentService.enrollStudentSubjects(studentId);
    },

    // ── QUERY HELPERS (Read-only) ───────────────
    getClasses: async (schoolId: string) => {
        return classService.getClasses(schoolId);
    },

    getClassSubjects: async (schoolId: string) => {
        return subjectService.getClassSubjects(schoolId);
    },

    getOnboardingStatus: async (institutionId: string) => {
        // Query schools for this institution
        const schools = await queryTable('schools', (builder) =>
            builder.select('id').eq('institution_id', institutionId)
        );

        const school = schools?.[0];
        if (!school) {
            return {
                hasSchool: false,
                hasClasses: false,
                hasTeachers: false,
                hasStudents: false,
                schoolId: null
            };
        }

        const school_id = school.id;

        // Parallel count queries (read-only, permitted)
        const [classResult, teacherResult, studentResult] = await Promise.all([
            queryTable('classes', (b) => b.select('id', { count: 'exact', head: true }).eq('school_id', school_id)),
            queryTable('teachers', (b) => b.select('id', { count: 'exact', head: true }).eq('school_id', school_id)),
            queryTable('students', (b) => b.select('id, classes!inner(school_id)', { count: 'exact', head: true }).eq('classes.school_id', school_id))
        ]);

        return {
            hasSchool: true,
            hasClasses: (classResult?.length ?? 0) > 0,
            hasTeachers: (teacherResult?.length ?? 0) > 0,
            hasStudents: (studentResult?.length ?? 0) > 0,
            schoolId: school_id
        };
    }
};
