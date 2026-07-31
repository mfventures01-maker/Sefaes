import { mockDb } from "../tests/mockDb";
import { CBTSessionStates } from "./cbtSessionFSM";
import { enterTransition, exitTransition } from "./mutationPolicy";

export class CBTOrchestrator {
    private static instance: CBTOrchestrator;

    private constructor() {}

    public static getInstance(): CBTOrchestrator {
        if (!CBTOrchestrator.instance) {
            CBTOrchestrator.instance = new CBTOrchestrator();
        }
        return CBTOrchestrator.instance;
    }

    public async orchestrateActiveSessions(elapsedMs: number): Promise<void> {
        const elapsedSec = Math.floor(elapsedMs / 1000);

        enterTransition();

        try {
            for (const session of Object.values(mockDb.cbtSessions)) {

                if (session.state === CBTSessionStates.ACTIVE_EXAM) {

                    session.remaining_time =
                        Math.max(0, (session.remaining_time || 0) - elapsedSec);

                    if (session.remaining_time <= 0) {

                        session.state = CBTSessionStates.SCORED;

                        const attempt = Object.values(mockDb.cbtAttempts)
                            .find((a: any) => a.session_id === session.id);

                        if (attempt) {
                            attempt.status = "submitted";
                            attempt.score = 85;
                            attempt.end_time = new Date().toISOString();
                        }
                    }
                }
            }

        } finally {
            exitTransition();
        }
    }
}
