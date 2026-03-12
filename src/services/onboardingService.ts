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
}

export interface TeacherPayload {
    school_id: string;
    name: string;
    email: string;
    phone: string;
}

export interface StudentPayload {
    class_id: string;
    first_name: string;
    last_name: string;
    gender: 'Male' | 'Female' | 'Other';
    student_number: string;
    date_of_birth: string;
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
        const { data, error } = await supabase
            .from('schools')
            .insert(payload)
            .select()
            .single();
        if (error) throw error;
        return data;
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

    enrollStudentSubjects: async (student_id: string) => {
        const { data, error } = await supabase.rpc('enroll_student_subjects', { student_id });
        if (error) throw error;
        return data;
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
    }
};
