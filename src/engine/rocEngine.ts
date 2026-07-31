// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 3.2 — REPLAY-ORIENTED COMMAND (ROC) ENGINE
// Day 6 Temporal Truth engine for timeline capture, hashing, and replay.
// ────────────────────────────────────────────────────────────────────────────

import crypto from 'crypto';
import { getAuthAuditLog, clearAuthAuditLog, AuditLogEntry } from '../server/auditPersistence';
import { CommandBus } from '../lib/CommandBus';
import { setMockIdentity } from '../server/authResolver';
import { mockDb, resetMockDb, MockDbState } from '../tests/mockDb';

export interface ROCTimeline {
    scopeType: string;
    scopeId: string;
    events: {
        userId: string;
        commandType: string;
        payload: any;
        timestamp: number;
    }[];
    integrityHash: string;
}

export class ROCEngine {
    /**
     * Builds a deterministic event timeline for a given scope (exam or session).
     */
    public static async buildTimeline(scopeType: string, scopeId: string): Promise<ROCTimeline> {
        const logs = getAuthAuditLog();
        
        // Filter logs matching the scope
        const filteredLogs = logs.filter(log => {
            if (!log.success) return false; // Only replay successful commands

            if (scopeType === 'session') {
                if (log.payload?.sessionId === scopeId) return true;
                if (log.commandType === 'CBT.START_SESSION') {
                    const session = mockDb.cbtSessions[scopeId];
                    if (session && session.exam_id === log.payload?.examId && session.student_id === log.payload?.studentId) {
                        return true;
                    }
                }
                return false;
            }
            if (scopeType === 'exam') {
                return (
                    log.payload?.examId === scopeId ||
                    // If it is a session command, check if the session points to the examId
                    (log.payload?.sessionId && mockDb.cbtSessions[log.payload.sessionId]?.exam_id === scopeId)
                );
            }
            return false;
        });

        // Sort events chronologically
        const sortedEvents = filteredLogs.sort((a, b) => a.timestamp - b.timestamp).map(log => ({
            userId: log.userId,
            commandType: log.commandType,
            payload: log.payload,
            timestamp: log.timestamp
        }));

        // Compute deterministic integrity hash
        const integrityHash = this.computeHash(sortedEvents);

        return {
            scopeType,
            scopeId,
            events: sortedEvents,
            integrityHash
        };
    }

    /**
     * Replays a timeline from a clean state and validates the output hash.
     */
    public static async replayTimeline(timeline: ROCTimeline): Promise<{ verified: boolean; integrityHash: string }> {
        // 1. Backup existing DB state
        const dbBackup: MockDbState = {
            cbtSessions: JSON.parse(JSON.stringify(mockDb.cbtSessions)),
            cbtSnapshots: JSON.parse(JSON.stringify(mockDb.cbtSnapshots)),
            cbtAttempts: JSON.parse(JSON.stringify(mockDb.cbtAttempts)),
            cbtExams: JSON.parse(JSON.stringify(mockDb.cbtExams)),
            students: JSON.parse(JSON.stringify(mockDb.students)),
            results: JSON.parse(JSON.stringify(mockDb.results)),
            auditLogs: JSON.parse(JSON.stringify(mockDb.auditLogs))
        };

        // 2. Backup and clear audit logs
        const auditBackup = getAuthAuditLog();
        clearAuthAuditLog();

        // Pre-scan timeline to map examId and studentId to original sessionId
        let mappedSessionId: string | null = null;
        let mappedExamId: string | null = null;
        let mappedStudentId: string | null = null;
        for (const event of timeline.events) {
            if (event.payload?.sessionId) {
                mappedSessionId = event.payload.sessionId;
            }
            if (event.commandType === 'CBT.START_SESSION') {
                mappedExamId = event.payload.examId;
                mappedStudentId = event.payload.studentId;
            }
        }

        // 3. Reset mock database to blank state
        resetMockDb();

        if (mappedSessionId && mappedExamId && mappedStudentId) {
            mockDb.cbtSessions[mappedSessionId] = {
                id: mappedSessionId,
                exam_id: mappedExamId,
                student_id: mappedStudentId,
                state: 'INITIALIZING'
            };
        }

        // Restore exams catalog for the exam ID being replayed
        if (timeline.scopeType === 'exam') {
            mockDb.cbtExams[timeline.scopeId] = dbBackup.cbtExams[timeline.scopeId] || {
                id: timeline.scopeId,
                duration_minutes: 60
            };
        } else if (timeline.scopeType === 'session') {
            const originalSession = dbBackup.cbtSessions[timeline.scopeId];
            if (originalSession) {
                mockDb.cbtExams[originalSession.exam_id] = dbBackup.cbtExams[originalSession.exam_id] || {
                    id: originalSession.exam_id,
                    duration_minutes: 60
                };
            }
        }

        const bus = CommandBus.getInstance();
        const replayedEvents: any[] = [];

        // 4. Sequentially execute replayed events
        for (const event of timeline.events) {
            // Set mock auth role based on command prefix/userID
            let role = 'student';
            if (event.commandType.startsWith('ADMIN.')) role = 'admin';
            else if (event.commandType.startsWith('TEACHER.')) role = 'teacher';
            
            setMockIdentity({
                userId: event.userId,
                role,
                schoolId: 'school-123'
            });

            // Dispatch command
            const res = await bus.dispatchCommand({
                type: event.commandType,
                payload: event.payload
            });

            if (res.success) {
                replayedEvents.push({
                    userId: event.userId,
                    commandType: event.commandType,
                    payload: event.payload,
                    timestamp: event.timestamp
                });
            }
        }

        // 5. Compute replay hash
        const replayHash = this.computeHash(replayedEvents);

        // 6. Restore original database & audit state
        Object.assign(mockDb, dbBackup);
        clearAuthAuditLog();
        for (const log of auditBackup) {
            // Re-hydrate the original audit ring buffer
            await import('../server/auditPersistence').then(m => m.persistAuditLog(log));
        }

        return {
            verified: replayHash === timeline.integrityHash,
            integrityHash: replayHash
        };
    }

    /**
     * Generates a deterministic hash from a sorted sequence of events.
     */
    private static computeHash(events: any[]): string {
        const hash = crypto.createHash('sha256');
        for (const event of events) {
            const serialized = JSON.stringify({
                userId: event.userId,
                commandType: event.commandType,
                payload: event.payload
            });
            hash.update(serialized);
        }
        return hash.digest('hex');
    }
}
