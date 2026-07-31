// ────────────────────────────────────────────────────────────────────────────
// SEFAES COMMAND AUTH GATE — JWT VERIFIER
// Server-Authoritative Identity Source.
// ────────────────────────────────────────────────────────────────────────────

import { supabase } from '../../lib/supabase';

export interface VerifiedIdentity {
    userId: string;
    role: string;
    institutionId?: string;
    schoolId?: string;
    email?: string;
}

export async function verifyJwtIdentity(jwt: string): Promise<VerifiedIdentity> {
    const { data: { user }, error } = await supabase.auth.getUser(jwt);
    
    if (error || !user) {
        throw new Error('INVALID_JWT_IDENTITY');
    }

    const appRole = user.app_metadata?.role;
    const resolvedRole = appRole || 'authenticated';

    return {
        userId: user.id,
        role: resolvedRole,
        institutionId: user.app_metadata?.institution_id,
        schoolId: user.app_metadata?.school_id,
        email: user.email
    };
}
