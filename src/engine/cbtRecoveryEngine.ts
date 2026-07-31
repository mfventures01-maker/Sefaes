import { mockDb } from '../tests/mockDb';
import { CBTSessionStates } from './cbtSessionFSM';
import { enterTransition, exitTransition } from './mutationPolicy';

export class CBTRecoveryEngine {
    public recoverSession(sessionId: string): { success: boolean } {
        const snapshots = mockDb.cbtSnapshots
            .filter((s: any) => s.session_id === sessionId)
            .sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
            
        if (snapshots.length === 0) {
            return { success: false };
        }
        
        const latest = snapshots[0];
        
        enterTransition();
        try {
            const session = mockDb.cbtSessions[sessionId];
            if (session) {
                session.state = latest.state || CBTSessionStates.ACTIVE_EXAM;
                session.current_question = latest.current_question || 0;
                session.remaining_time = latest.remaining_time || 3600;
            }
        } finally {
            exitTransition();
        }
        
        return { success: true };
    }
}
