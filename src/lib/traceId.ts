// ────────────────────────────────────────────────────────────────────────────
// SEFAES PHASE 2 — TRACE ID SYSTEM
// Every command carries a globally unique trace identifier.
// TraceIds are logged at: dispatch, execution, failure, completion.
// ────────────────────────────────────────────────────────────────────────────

/** Available trace namespaces map to command domains */
export type TraceNamespace =
    | 'EXAM'
    | 'UPLOAD'
    | 'OCR'
    | 'GRADE'
    | 'STUDENT'
    | 'SUBJECT'
    | 'CLASS'
    | 'IDENTITY'
    | 'AUTH'
    | 'SYS';

/**
 * Generates a deterministic, human-readable trace ID.
 * Format: `SEFAES-<NAMESPACE>-<TIMESTAMP_BASE36>-<RANDOM>`
 *
 * Example: `SEFAES-UPLOAD-LJK2C-91KD`
 */
export function generateTraceId(namespace: TraceNamespace): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SEFAES-${namespace}-${ts}-${rand}`;
}

/**
 * Infers a trace namespace from a command type string.
 * Falls back to 'SYS' for unknown prefixes.
 */
export function namespaceFromCommand(commandType: string): TraceNamespace {
    const lower = commandType.toLowerCase();
    if (lower.startsWith('auth.'))  return 'AUTH';
    if (lower.includes('exam'))    return 'EXAM';
    if (lower.includes('upload') || lower.includes('storage')) return 'UPLOAD';
    if (lower.includes('ocr'))     return 'OCR';
    if (lower.includes('grading') || lower.includes('grade')) return 'GRADE';
    if (lower.includes('student')) return 'STUDENT';
    if (lower.includes('subject')) return 'SUBJECT';
    if (lower.includes('class'))   return 'CLASS';
    if (lower.includes('identity')) return 'IDENTITY';
    return 'SYS';
}
