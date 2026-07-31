// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: institutionService
// Manages institution creation signals
// ──────────────────────────────────────────────

import { callRPC } from '../lib/rpcClient';
import { RPC_SIGNALS } from '../lib/rpcSignalRegistry';

export interface InstitutionPayload {
    institution_name: string;
    institution_type: string;
    country: string;
    state: string;
    admin_email: string;
    password?: string;
}

export interface InstitutionResponse {
    institution_id: string;
    admin_user_id: string;
}

export const institutionService = {
    /**
     * SIGNAL: CREATE_INSTITUTION_ACCOUNT
     * Atomically creates institution, principal, and profile records.
     */
    createInstitutionAccount: async (form: InstitutionPayload): Promise<InstitutionResponse> => {
        const payload = {
            _institution_name: form.institution_name,
            _admin_email: form.admin_email,
            _admin_password: form.password || '', // REQUIRED: Pass the raw password string
            _institution_type: form.institution_type,
            _country: form.country
        };

        console.log("[RPC TRACE] create_institution_account payload:", payload);

        return callRPC<InstitutionResponse>(
            RPC_SIGNALS.CREATE_INSTITUTION_ACCOUNT,
            payload
        );
    }
};
