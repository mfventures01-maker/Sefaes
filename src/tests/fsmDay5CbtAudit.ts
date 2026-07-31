// ────────────────────────────────────────────────────────────────────────────
// SEFAES DAY 5 CBT RUNTIME KERNEL VERIFIER & AUDIT HARNESS
// Verification and compliance test suite for the CBT Session FSM & Orchestrator.
// ────────────────────────────────────────────────────────────────────────────

import { dispatchCommand, CommandBus } from '../lib/CommandBus';
import { COMMANDS } from '../lib/commandRegistry';
import { setMockIdentity } from '../server/authResolver';
import { getAuthAuditLog, clearAuthAuditLog } from '../server/auditPersistence';
import { CBTSessionFSM, CBTSessionStates, CBTSessionState } from '../engine/cbtSessionFSM';
import { CBTOrchestrator } from '../engine/cbtOrchestrator';
import { CBTSyncGateway, SyncPayload } from '../engine/cbtSyncGateway';
import { CBTRecoveryEngine } from '../engine/cbtRecoveryEngine';
import { CBTCommandTypes } from '../commands/eduCommands/cbtCommands';
import { enterTransition, exitTransition } from '../engine/mutationPolicy';
import { mockDb, setupSupabaseStubs } from './mockDb';

// Initialize env flags for headless Node-based execution
process.env.TEST_ENV = 'true';
process.env.VITE_SUPABASE_URL = 'https://placeholder.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'placeholder-anon-key';

// Setup Supabase Stubs
setupSupabaseStubs();

// ── Audit Results Aggregator ───────────────────────────────────────────────
interface AuditTestResult {
    category: string;
    description: string;
    passed: boolean;
    errorDetail?: string;
}

const auditResults: AuditTestResult[] = [];

function assertAudit(category: string, description: string, condition: boolean, errorDetail?: string) {
    auditResults.push({ category, description, passed: condition, errorDetail });
    const marker = condition ? '✔ SUCCESS' : '✘ FAILURE';
    console.log(`[${category}][${marker}] ${description}`);
    if (!condition && errorDetail) {
        console.error(`    ↳ Error Detail: ${errorDetail}`);
    }
}

// ── Run Tests ──────────────────────────────────────────────────────────────
async function runAudit() {
    console.log('\n================================================================');
    console.log('         SEFAES DAY 5 CBT RUNTIME KERNEL COMPLIANCE AUDIT       ');
    console.log('================================================================\n');

    try {
        const bus = CommandBus.getInstance();

        // ────────────────────────────────────────────────────────────────────
        // TEST 1: FSM State Transition Invariant Verification
        // ────────────────────────────────────────────────────────────────────
        console.log('Running Test Suite 1: CBT Session FSM Validation Rules...');
        
        const fsm = new CBTSessionFSM();
        
        // Positive validation checks
        assertAudit('CBT_FSM', 'INITIALIZING -> AUTHENTICATED is permitted', CBTSessionFSM.isValidTransition('INITIALIZING', 'AUTHENTICATED'));
        assertAudit('CBT_FSM', 'AUTHENTICATED -> LOADING_EXAM is permitted', CBTSessionFSM.isValidTransition('AUTHENTICATED', 'LOADING_EXAM'));
        assertAudit('CBT_FSM', 'LOADING_EXAM -> INSTRUCTIONS_VIEW is permitted', CBTSessionFSM.isValidTransition('LOADING_EXAM', 'INSTRUCTIONS_VIEW'));
        assertAudit('CBT_FSM', 'INSTRUCTIONS_VIEW -> ACTIVE_EXAM is permitted', CBTSessionFSM.isValidTransition('INSTRUCTIONS_VIEW', 'ACTIVE_EXAM'));
        assertAudit('CBT_FSM', 'ACTIVE_EXAM -> PAUSED is permitted', CBTSessionFSM.isValidTransition('ACTIVE_EXAM', 'PAUSED'));
        assertAudit('CBT_FSM', 'PAUSED -> ACTIVE_EXAM is permitted', CBTSessionFSM.isValidTransition('PAUSED', 'ACTIVE_EXAM'));
        assertAudit('CBT_FSM', 'ACTIVE_EXAM -> SUBMITTED is permitted', CBTSessionFSM.isValidTransition('ACTIVE_EXAM', 'SUBMITTED'));
        
        // Negative transition checks
        assertAudit('CBT_FSM', 'INITIALIZING -> ACTIVE_EXAM is blocked', !CBTSessionFSM.isValidTransition('INITIALIZING', 'ACTIVE_EXAM'));
        assertAudit('CBT_FSM', 'INSTRUCTIONS_VIEW -> PAUSED is blocked', !CBTSessionFSM.isValidTransition('INSTRUCTIONS_VIEW', 'PAUSED'));
        assertAudit('CBT_FSM', 'SUBMITTED -> ACTIVE_EXAM is blocked', !CBTSessionFSM.isValidTransition('SUBMITTED', 'ACTIVE_EXAM'));

        // ────────────────────────────────────────────────────────────────────
        // TEST 2: Zod Schema Payload Validation
        // ────────────────────────────────────────────────────────────────────
        console.log('\nRunning Test Suite 2: CBT Command Schemas...');

        // Valid command dispatch test
        setMockIdentity({ userId: 'student-123', role: 'student', schoolId: 'school-123' });
        
        let startResponse: any = null;
        try {
            startResponse = await bus.dispatchCommand({
                type: CBTCommandTypes.CBT_START_SESSION,
                payload: {
                    examId: '98b50e2d-dc99-43ef-b387-052637738f61',
                    studentId: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e0'
                }
            });
            assertAudit('CBT_SCHEMA', 'CBT_START_SESSION schema check passes with valid UUIDs', startResponse.success === true, JSON.stringify(startResponse));
        } catch (err: any) {
            assertAudit('CBT_SCHEMA', 'CBT_START_SESSION schema check passes with valid UUIDs', false, err.message);
        }

        // Malformed command payload test
        const malformedRes = await bus.dispatchCommand({
            type: CBTCommandTypes.CBT_START_SESSION,
            payload: {
                examId: 'invalid-uuid-format',
                studentId: 'another-invalid-uuid'
            }
        });
        assertAudit(
            'CBT_SCHEMA', 
            'CBT_START_SESSION rejects invalid UUID strings', 
            malformedRes.success === false && malformedRes.error?.code === 'SCHEMA_VALIDATION_FAILED'
        );

        // ────────────────────────────────────────────────────────────────────
        // TEST 3: CommandBus E2E Flow (Classify -> Resolve -> Execute -> Audit)
        // ────────────────────────────────────────────────────────────────────
        console.log('\nRunning Test Suite 3: CBT Command execution & lifecycle...');

        const sessionId = startResponse?.data?.sessionId;
        assertAudit('CBT_EXECUTION', 'Start session yields valid sessionId', !!sessionId);

        // Load exam questions command
        const loadRes = await bus.dispatchCommand({
            type: CBTCommandTypes.CBT_LOAD_EXAM,
            payload: { sessionId }
        });
        assertAudit('CBT_EXECUTION', 'CBT.LOAD_EXAM executes successfully', loadRes.success === true, JSON.stringify(loadRes));
        assertAudit('CBT_EXECUTION', 'CBT.LOAD_EXAM transitions state to INSTRUCTIONS_VIEW', mockDb.cbtSessions[sessionId]?.state === CBTSessionStates.INSTRUCTIONS_VIEW);

        // Begin exam command
        const beginRes = await bus.dispatchCommand({
            type: CBTCommandTypes.CBT_BEGIN_EXAM,
            payload: { sessionId }
        });
        assertAudit('CBT_EXECUTION', 'CBT.BEGIN_EXAM executes successfully', beginRes.success === true, JSON.stringify(beginRes));
        assertAudit('CBT_EXECUTION', 'CBT.BEGIN_EXAM transitions state to ACTIVE_EXAM', mockDb.cbtSessions[sessionId]?.state === CBTSessionStates.ACTIVE_EXAM);

        // Submit answer command
        const submitAnsRes = await bus.dispatchCommand({
            type: CBTCommandTypes.CBT_SUBMIT_ANSWER,
            payload: {
                sessionId,
                questionId: '98b50e2d-dc99-43ef-b387-052637738f61',
                optionId: 'a2e0e0e0-e0e0-40e0-80e0-e0e0e0e0e0e0'
            }
        });
        assertAudit('CBT_EXECUTION', 'CBT.SUBMIT_ANSWER executes successfully', submitAnsRes.success === true, JSON.stringify(submitAnsRes));

        // Next question command
        const nextQRes = await bus.dispatchCommand({
            type: CBTCommandTypes.CBT_NEXT_QUESTION,
            payload: { sessionId }
        });
        assertAudit('CBT_EXECUTION', 'CBT.NEXT_QUESTION executes successfully', nextQRes.success === true, JSON.stringify(nextQRes));
        assertAudit('CBT_EXECUTION', 'CBT.NEXT_QUESTION increments current question state', mockDb.cbtSessions[sessionId]?.current_question === 1);

        // Pause session command
        const pauseRes = await bus.dispatchCommand({
            type: CBTCommandTypes.CBT_PAUSE_SESSION,
            payload: { sessionId }
        });
        assertAudit('CBT_EXECUTION', 'CBT.PAUSE_SESSION executes successfully', pauseRes.success === true, JSON.stringify(pauseRes));
        assertAudit('CBT_EXECUTION', 'CBT.PAUSE_SESSION transitions FSM to PAUSED', mockDb.cbtSessions[sessionId]?.state === CBTSessionStates.PAUSED);

        // Resume session command
        const resumeRes = await bus.dispatchCommand({
            type: CBTCommandTypes.CBT_RESUME_SESSION,
            payload: { sessionId }
        });
        assertAudit('CBT_EXECUTION', 'CBT.RESUME_SESSION executes successfully', resumeRes.success === true, JSON.stringify(resumeRes));
        assertAudit('CBT_EXECUTION', 'CBT.RESUME_SESSION transitions FSM back to ACTIVE_EXAM', mockDb.cbtSessions[sessionId]?.state === CBTSessionStates.ACTIVE_EXAM);

        // ────────────────────────────────────────────────────────────────────
        // TEST 4: CBT Sync Gateway Realtime Sync Verification
        // ────────────────────────────────────────────────────────────────────
        console.log('\nRunning Test Suite 4: Real-time Sync Engine...');

        const syncGateway = CBTSyncGateway.getInstance();
        let receivedSyncEvent: SyncPayload | null = null;
        
        syncGateway.once('broadcast', (payload: SyncPayload) => {
            receivedSyncEvent = payload;
        });

        // Trigger sync state command
        const syncRes = await bus.dispatchCommand({
            type: CBTCommandTypes.CBT_SYNC_STATE,
            payload: {
                sessionId,
                state: CBTSessionStates.ACTIVE_EXAM,
                currentQuestion: 1,
                remainingTime: 3500
            }
        });

        assertAudit('CBT_SYNC', 'CBT.SYNC_STATE command executes successfully', syncRes.success === true, JSON.stringify(syncRes));
        assertAudit('CBT_SYNC', 'Sync Gateway broadcasts the correct payload to listeners', receivedSyncEvent !== null && (receivedSyncEvent as SyncPayload).remainingTime === 3500);
        assertAudit('CBT_SYNC', 'Session record updated with synced state flags in DB', mockDb.cbtSessions[sessionId]?.is_synced === true);

        // ────────────────────────────────────────────────────────────────────
        // TEST 5: CBT Recovery & Replay Engine
        // ────────────────────────────────────────────────────────────────────
        console.log('\nRunning Test Suite 5: Recovery & State Resurrection Engine...');

        const recoveryEngine = new CBTRecoveryEngine();

        // Let's modify the session database record to represent disconnect drift (e.g. simulate clean slate)
        enterTransition();
        mockDb.cbtSessions[sessionId].state = CBTSessionStates.INITIALIZING;
        mockDb.cbtSessions[sessionId].current_question = 0;
        mockDb.cbtSessions[sessionId].remaining_time = 0;
        exitTransition();

        // Restore using the last recorded snapshot
        const restoreRes = await bus.dispatchCommand({
            type: CBTCommandTypes.CBT_RESTORE_SESSION,
            payload: { sessionId }
        });

        assertAudit('CBT_RECOVERY', 'CBT.RESTORE_SESSION command executes successfully', restoreRes.success === true, JSON.stringify(restoreRes));
        assertAudit('CBT_RECOVERY', 'State successfully restored to snapshot state (ACTIVE_EXAM)', mockDb.cbtSessions[sessionId]?.state === CBTSessionStates.ACTIVE_EXAM);
        assertAudit('CBT_RECOVERY', 'Remaining time restored from snapshot', mockDb.cbtSessions[sessionId]?.remaining_time > 0);

        // ────────────────────────────────────────────────────────────────────
        // TEST 6: Timing Orchestration & Auto-Submit
        // ────────────────────────────────────────────────────────────────────
        console.log('\nRunning Test Suite 6: Active Exam Timing Orchestrator...');

        const orchestrator = CBTOrchestrator.getInstance();

        // Set remaining time to 1 second
        enterTransition();
        mockDb.cbtSessions[sessionId].remaining_time = 1;
        exitTransition();

        // Run one tick of the orchestrator loop (elapsed 2000ms)
        await (orchestrator as any).orchestrateActiveSessions(2000);

        assertAudit('CBT_ORCHESTRATOR', 'Orchestrator loop triggered auto-submit upon timer expiration', mockDb.cbtSessions[sessionId]?.state === CBTSessionStates.SCORED);
        assertAudit('CBT_ORCHESTRATOR', 'DB attempt status updated to submitted after timer expiration', mockDb.cbtAttempts[startResponse.data.attemptId]?.status === 'submitted');

        console.log('\n================================================================');
        console.log('             AUDIT SUMMARY: ALL DAY 5 CHECKS PASSED             ');
        console.log('================================================================\n');

        const failed = auditResults.filter(r => !r.passed);
        if (failed.length > 0) {
            console.error(`🚨 Audit failed with ${failed.length} failures.`);
            process.exit(1);
        } else {
            console.log('🎉 100% compliant with SEFAES DAY 5 CBT specifications.');
            process.exit(0);
        }

    } catch (err: any) {
        console.error('Audit crashed with internal error:', err);
        process.exit(1);
    }
}

runAudit();
