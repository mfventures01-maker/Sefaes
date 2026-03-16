import { supabase } from '../lib/supabase';

export interface TeacherIdentity {
    teacher_id: string;
    school_id: string;
    teacher_name: string;
    teacher_email: string;
}

export const identityService = {
    // SIGNAL: RESOLVE_TEACHER_IDENTITY
    resolveTeacher: async (): Promise<TeacherIdentity | null> => {
        const { data, error } = await supabase.rpc('resolve_teacher_identity');
        if (error) throw error;
        return data as TeacherIdentity | null;
    }
};
