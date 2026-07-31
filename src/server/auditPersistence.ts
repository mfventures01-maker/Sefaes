export interface AuditLogEntry {
    userId: string;
    commandType: string;
    payload: any;
    timestamp: number;
    success: boolean;
    errorReason?: string;
    traceId?: string;
}

let auditLogMemory: AuditLogEntry[] = [];

export async function persistAuditLog(entry: AuditLogEntry): Promise<void> {
    auditLogMemory.push(entry);
    
    if (entry.success) {
        console.info(`[AUDIT][SUCCESS] ${entry.traceId || 'no-trace'} -> ${entry.commandType} by ${entry.userId}`);
    } else {
        console.error(`[AUDIT][FAILURE] ${entry.traceId || 'no-trace'} -> ${entry.commandType}: ${entry.errorReason}`);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            window.localStorage.setItem('sefaes_auth_audit_log', JSON.stringify(auditLogMemory.slice(-200)));
        } catch (e) {
            // ignore
        }
    }
}

export function getAuthAuditLog(): AuditLogEntry[] {
    if (auditLogMemory.length === 0 && typeof window !== 'undefined' && window.localStorage) {
        try {
            const raw = window.localStorage.getItem('sefaes_auth_audit_log');
            if (raw) {
                auditLogMemory = JSON.parse(raw);
            }
        } catch (e) {
            // ignore
        }
    }
    return [...auditLogMemory];
}

export function clearAuthAuditLog(): void {
    auditLogMemory = [];
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            window.localStorage.removeItem('sefaes_auth_audit_log');
        } catch (e) {
            // ignore
        }
    }
}
