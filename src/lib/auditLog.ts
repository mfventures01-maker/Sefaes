// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 2 — AUDIT LOG LAYER
// Every command dispatch generates an immutable audit entry.
// Stored in-memory (ring buffer) and persisted to localStorage for session.
// ────────────────────────────────────────────────────────────────────────────

import type { AuditEntry } from './commandTypes';

const STORAGE_KEY = 'sefaes_audit_log';
const MAX_ENTRIES = 200; // ring buffer cap

let _memoryLog: AuditEntry[] = [];

/** Restore session audit log from localStorage on module load */
function hydrate(): void {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            _memoryLog = JSON.parse(raw) as AuditEntry[];
        }
    } catch {
        _memoryLog = [];
    }
}

hydrate();

function persist(): void {
    try {
        // Keep only latest MAX_ENTRIES
        const trimmed = _memoryLog.slice(-MAX_ENTRIES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        _memoryLog = trimmed;
    } catch {
        // localStorage may be full; not a fatal error
    }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Records an audit entry for a dispatched command.
 */
export function auditDispatch(traceId: string, action: string, actor: string, payload?: Record<string, unknown>): void {
    const entry: AuditEntry = {
        traceId,
        actor,
        action,
        status: 'DISPATCHED',
        payload,
        timestamp: Date.now(),
    };
    _memoryLog.push(entry);
    persist();
    console.info(`[AUDIT][DISPATCH] ${traceId} → ${action} by ${actor}`);
}

/**
 * Records a successful command completion.
 */
export function auditSuccess(traceId: string, action: string, actor: string): void {
    const entry: AuditEntry = {
        traceId,
        actor,
        action,
        status: 'SUCCESS',
        timestamp: Date.now(),
    };
    _memoryLog.push(entry);
    persist();
    console.info(`[AUDIT][SUCCESS] ${traceId} → ${action}`);
}

/**
 * Records a command failure with error detail.
 */
export function auditFailure(traceId: string, action: string, actor: string, error: string): void {
    const entry: AuditEntry = {
        traceId,
        actor,
        action,
        status: 'FAILURE',
        error,
        timestamp: Date.now(),
    };
    _memoryLog.push(entry);
    persist();
    console.error(`[AUDIT][FAILURE] ${traceId} → ${action}: ${error}`);
}

/**
 * Returns a copy of the full audit log (latest entries last).
 */
export function getAuditLog(): AuditEntry[] {
    return [..._memoryLog];
}

/**
 * Clears the in-memory and persisted audit log.
 */
export function clearAuditLog(): void {
    _memoryLog = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
}
