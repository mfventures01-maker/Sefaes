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
    createInstitutionAccount: async (payload: InstitutionPayload): Promise<InstitutionResponse> => {
        return callRPC<InstitutionResponse>(
            RPC_SIGNALS.CREATE_INSTITUTION_ACCOUNT,
            payload
        );
    }
};
