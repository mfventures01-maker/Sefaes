// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: authService
// Wraps all Supabase Authentication and Profile actions via dbGateway
// ──────────────────────────────────────────────

import { db, auth } from '../db/dbGateway';

export interface UserProfile {
    id: string;
    user_id: string;
    institution_id: string;
    full_name: string;
   role:
    | 'admin'
    | 'teacher'
    | 'student'
    | 'parent'
    | 'examiner'
    | 'ceo'
    | 'super_admin';
    created_at: string;
}

export const authService = {
    /**
     * Resolves currently logged-in user details.
     */
    getUser: async () => {
        return auth.getUser();
    },

    /**
     * Retrieves the current session object.
     */
    getSession: async () => {
        return auth.getSession();
    },

    /**
     * Signs in a user using email and password.
     */
    signInWithPassword: async (credentials: { email: string; password: string }) => {
        return auth.signInWithPassword(credentials);
    },

    /**
     * Signs up a user using email and password.
     */
    signUp: async (credentials: { email: string; password: string }) => {
        return auth.signUp(credentials);
    },

    /**
     * Logs out the current user session.
     */
    signOut: async () => {
        return auth.signOut();
    },

    /**
     * Retrieves the profile associated with the user.
     */
    getProfile: async (userId: string) => {
        try {
            const data = await db.select('profiles', (builder) =>
                builder.select('institution_id, role').eq('user_id', userId).single()
            );
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    /**
     * Retrieves the full profile record.
     */
    getFullProfile: async (userId: string) => {
        try {
            const data = await db.select('profiles', (builder) =>
                builder.select('*').eq('user_id', userId).single()
            );
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    /**
     * Retrieves profile joined with institution.
     */
    getProfileWithInstitution: async (userId: string) => {
        try {
            const data = await db.select('profiles', (builder) =>
                builder.select(`
                    full_name,
                    role,
                    institution_id,
                    institutions (
                        name,
                        type
                    )
                `).eq('user_id', userId).single()
            );
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    /**
     * Retrieves institution type.
     */
    getInstitutionType: async (institutionId: string) => {
        try {
            const data = await db.select('institutions', (builder) =>
                builder.select('type').eq('id', institutionId).single()
            );
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    },

    /**
     * Retrieves school ID based on email address.
     */
    getSchoolByEmail: async (email: string) => {
        try {
            const data = await db.select('schools', (builder) =>
                builder.select('id').eq('email', email).single()
            );
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
};
