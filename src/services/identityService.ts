// ──────────────────────────────────────────────
// SEFAES DETERMINISTIC SIGNAL PROTOCOL
// Service: identityService
// Resolves authenticated user identity via RPC
// ──────────────────────────────────────────────

import { callRPC } from '../lib/rpcClient';
import { RPC_SIGNALS } from '../lib/rpcSignalRegistry';

export interface TeacherIdentity {
    teacher_id: string;
    school_id: string;
    teacher_name: string;
    teacher_email: string;
}

export const identityService = {
    /**
     * SIGNAL: RESOLVE_TEACHER_IDENTITY
     * Resolves the currently authenticated user's teacher record.
     */
    resolveTeacher: async (): Promise<TeacherIdentity | null> => {
        return callRPC<TeacherIdentity | null>(
            RPC_SIGNALS.RESOLVE_TEACHER_IDENTITY
        );
    }
};
