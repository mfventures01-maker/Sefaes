// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 2.1 — COMMAND FIREWALL
// First gate before any command reaches the CommandBus.
// Responsibilities:
//   1. Validate command exists in the registry
//   2. Validate payload is a non-null object
//   3. Attach traceId if missing
//   4. Reject unknown commands immediately (no silent fallback)
//   5. Log validation outcome to audit trail
// ────────────────────────────────────────────────────────────────────────────

import type { Command } from './commandTypes';
import { assertCommandRegistered } from './commandRegistry';
import { generateTraceId, namespaceFromCommand } from './traceId';
import { auditFailure } from './auditLog';
import { ERROR_CODES, classifyError } from './errorTaxonomy';

export type FirewallResult<T> =
    | { ok: true; command: Command<T> }
    | { ok: false; error: ReturnType<typeof classifyError> };

/**
 * Validates and enriches an inbound command before execution.
 * Returns a tagged union: ok=true with the enriched command, or ok=false with a structured error.
 *
 * RULES:
 * - type must be in the COMMANDS registry
 * - payload must be a non-null object
 * - traceId is auto-generated if absent
 * - timestamp is set to now if absent
 * - source defaults to 'ui'
 */
export function firewall<T = Record<string, unknown>>(
    raw: { type: string; payload?: unknown; traceId?: string; source?: Command['source'] }
): FirewallResult<T> {
    // ── 1. Generate traceId before anything else so errors can reference it ──
    const traceId = raw.traceId ?? generateTraceId(namespaceFromCommand(raw.type));

    // ── 2. Registry check ────────────────────────────────────────────────────
    try {
        assertCommandRegistered(raw.type);
    } catch (err) {
        const structured = classifyError(err, traceId);
        auditFailure(traceId, raw.type ?? 'UNKNOWN', 'firewall', (err as Error).message);
        return { ok: false, error: structured };
    }

    // ── 3. Payload validation ─────────────────────────────────────────────────
    if (raw.payload === null || raw.payload === undefined || typeof raw.payload !== 'object') {
        const msg = `INVALID_PAYLOAD: Command "${raw.type}" requires a non-null object payload`;
        const structured = classifyError(new Error(msg), traceId);
        auditFailure(traceId, raw.type, 'firewall', msg);
        return { ok: false, error: { ...structured, code: ERROR_CODES.INVALID_PAYLOAD } };
    }

    // ── 4. Build fully-typed Command object ───────────────────────────────────
    const command: Command<T> = {
        type: raw.type,
        payload: raw.payload as T,
        traceId,
        source: raw.source ?? 'ui',
        timestamp: Date.now(),
    };

    return { ok: true, command };
}
