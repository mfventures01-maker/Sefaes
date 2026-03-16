import { supabase } from '../lib/supabase';

export interface InstitutionPayload {
    institution_name: string;
    institution_type: string;
    country: string;
    state: string;
    admin_email: string;
    password?: string;
}

export interface SchoolPayload {
    institution_id: string;
    school_name: string;
    school_type: 'Secondary' | 'Primary';
    address: string;
    email: string;
    phone: string;
    logo_url: string;
    principal_name: string;
    vice_principal_name: string;
}

export interface TeacherPayload {
    school_id: string;
    name: string;
    email: string;
    phone: string;
}

export interface StudentPayload {
    first_name: string;
    last_name: string;
    gender: 'male' | 'female';
    student_number: string;
    class_id: string;
    date_of_birth?: string;
}

export const onboardingService = {
    // Stage 1: Institution Creation
    createInstitutionAccount: async (payload: InstitutionPayload) => {
        const { data, error } = await supabase.rpc('create_institution_account', payload);
        if (error) throw error;
        return data as { institution_id: string; admin_user_id: string };
    },

    // Stage 2: School Setup
    createSchool: async (payload: SchoolPayload) => {
        const { data, error } = await supabase.rpc('create_school_with_classes', {
            p_school_name: payload.school_name,
            p_school_type: payload.school_type,
            p_email: payload.email,
            p_phone: payload.phone,
            p_address: payload.address,
            p_logo_url: payload.logo_url,
            p_principal_name: payload.principal_name,
            p_vice_principal_name: payload.vice_principal_name,
            p_institution_id: payload.institution_id
        });
        if (error) throw error;
        return data;
    },

    updateSchoolSettings: async (schoolId: string, payload: Partial<SchoolPayload>) => {
        const { error } = await supabase
            .from('schools')
            .update(payload)
            .eq('id', schoolId);
        if (error) throw error;
    },

    createClass: async (payload: { name: string; school_id: string }) => {
        const { data, error } = await supabase
            .from('classes')
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteClass: async (id: string) => {
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Stage 3: Academic Structure Initialization
    initializeSecondaryClasses: async (school_id: string) => {
        const { data, error } = await supabase.rpc('initialize_secondary_classes', { school_id });
        if (error) throw error;
        return data;
    },

    // Stage 4: Subject System Initialization
    initializeClassSubjects: async (school_id: string) => {
        const { data, error } = await supabase.rpc('initialize_class_subjects', { school_id });
        if (error) throw error;
        return data;
    },

    // Stage 5: Teacher Creation
    createTeacher: async (payload: TeacherPayload) => {
        const { data, error } = await supabase
            .from('teachers')
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    assignTeacherToSubject: async (teacher_id: string, class_subject_id: string) => {
        const { data, error } = await supabase
            .from('teacher_subject_assignments')
            .insert({ teacher_id, class_subject_id })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Stage 6: Student Enrollment
    enrollStudent: async (payload: StudentPayload) => {
        const { data, error } = await supabase
            .from('students')
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    bulkEnrollStudents: async (rows: StudentPayload[]) => {
        const { error } = await supabase
            .from('students')
            .insert(rows);
        if (error) throw error;
    },

    enrollStudentSubjects: async (student_id: string) => {
        const { data, error } = await supabase.rpc('enroll_student_subjects', { student_id });
        if (error) throw error;
        return data;
    },

    createSubjectInCatalog: async (name: string, category?: string) => {
        const { data, error } = await supabase
            .from('subject_catalog')
            .insert({ name, category })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    assignSubjectToClass: async (class_id: string, subject_id: string, school_id: string) => {
        const { data, error } = await supabase
            .from('class_subjects')
            .insert({ class_id, subject_id, school_id })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteSubjectAssignment: async (id: string) => {
        const { error } = await supabase
            .from('class_subjects')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },


    // Helpers
    getClasses: async (school_id: string) => {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('school_id', school_id)
            .order('name');
        if (error) throw error;
        return data;
    },

    getClassSubjects: async (school_id: string) => {
        const { data, error } = await supabase
            .from('class_subjects')
            .select(`
                id,
                class_id,
                classes!inner(name, school_id),
                subject_id,
                subject_catalog!inner(name)
            `)
            .eq('classes.school_id', school_id);

        if (error) throw error;
        return data;
    },

    getOnboardingStatus: async (institution_id: string) => {
        // 1. Get the school(s) for this institution
        const { data: schools } = await supabase
            .from('schools')
            .select('id')
            .eq('institution_id', institution_id);

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

        // 2. Check for other records for this school
        const [classes, teachers, students] = await Promise.all([
            supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', school_id),
            supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('school_id', school_id),
            supabase.from('students').select('id, classes!inner(school_id)', { count: 'exact', head: true }).eq('classes.school_id', school_id)
        ]);

        return {
            hasSchool: true,
            hasClasses: (classes.count ?? 0) > 0,
            hasTeachers: (teachers.count ?? 0) > 0,
            hasStudents: (students.count ?? 0) > 0,
            schoolId: school_id
        };
    }
};
