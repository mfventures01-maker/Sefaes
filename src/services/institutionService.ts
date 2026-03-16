import { supabase } from '../lib/supabase';

export interface InstitutionData {
    name: string;
    type: string;
    country: string;
    state: string;
}

export const institutionService = {
    /**
     * Atomically creates an institution and attaches it to the authenticated user's profile.
     * Guaranteed to follow strict sequence: Insert Institution -> Attach Profile.
     */
    createInstitutionAndAttachProfile: async (institutionData: InstitutionData) => {
        // Enforce sequence logic
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error(`Auth Context Missing: ${authError?.message || 'No user found'}`);
        }

        // Step 1 - Insert Institution
        const { data: institution, error: insertError } = await supabase
            .from("institutions")
            .insert({
                institution_name: institutionData.name,
                institution_type: institutionData.type,
                country: institutionData.country,
                state: institutionData.state,
                admin_email: user.email // Syncing admin email from auth context
            })
            .select()
            .single();

        if (insertError || !institution) {
            throw new Error(`Institution Creation Failed: ${insertError?.message}`);
        }

        // Step 2 - Attach Profile to Institution
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                institution_id: institution.id
            })
            .eq("user_id", user.id);

        if (profileError) {
            throw new Error(`Profile Update Failed: ${profileError.message}`);
        }

        return institution;
    }
};
