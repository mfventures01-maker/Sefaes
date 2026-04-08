// Audit Trail System - Phase 3 + Phase 5 (Payment Gate Hardening)
// Local-first audit event tracking with localStorage persistence

export type AuditEventType =
    | 'order_created'
    | 'item_added'
    | 'item_removed'
    | 'checkout_started'
    | 'payment_method_selected'
    | 'checkout_completed'
    | 'payment_intent_created'
    | 'payment_submitted'
    | 'payment_verification_attempted'
    | 'ceo_override'
    | 'order_cancelled'
    | 'payment_claimed'
    | 'payment_verified'
    | 'payment_rejected'
    | 'order_fulfilled'
    | 'channel_selected'
    | 'message_opened'
    | 'handoff_completed';

export type ActorRole = 'ceo' | 'manager' | 'staff';

export interface AuditEvent {
    id: string;
    event_type: AuditEventType;
    actor_role: ActorRole;
    ref: {
        orderId?: string;
        tableId?: string;
        paymentIntentId?: string;
    };
    timestamp: string; // ISO string
    metadata?: {
        paymentMethod?: 'POS' | 'TRANSFER' | 'CASH';
        paymentStatus?: 'pending' | 'claimed' | 'verified' | 'expired' | 'voided';
        totalAmount?: number;
        itemCount?: number;
        status?: string;
        verifiedBy?: ActorRole;
        channel?: 'whatsapp' | 'telegram' | 'in-app';
        verificationCode?: string;
        [key: string]: any;
    };
}

const STORAGE_KEY = 'defacto_audit_events_v1';

class AuditStore {
    private events: AuditEvent[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.events = JSON.parse(stored);
            }
        } catch (error) {
            console.error('[AUDIT_STORE] Failed to load from localStorage:', error);
            this.events = [];
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
        } catch (error) {
            console.error('[AUDIT_STORE] Failed to save to localStorage:', error);
        }
    }

    addEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
        const auditEvent: AuditEvent = {
            ...event,
            id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
        };

        this.events.unshift(auditEvent); // Add to beginning (newest first)
        this.saveToStorage();

        // Console evidence log
        console.log(
            `[AUDIT] event=${auditEvent.event_type} actor_role=${auditEvent.actor_role} ` +
            `tableId=${auditEvent.ref.tableId || 'N/A'} orderId=${auditEvent.ref.orderId || 'N/A'} ` +
            `timestamp=${auditEvent.timestamp} meta=${JSON.stringify(auditEvent.metadata || {})}`
        );

        // Special TXN_LOG for checkout completion
        if (auditEvent.event_type === 'checkout_completed' && auditEvent.metadata) {
            console.log(
                `[TXN_LOG] paymentMethod=${auditEvent.metadata.paymentMethod || 'N/A'} ` +
                `tableId=${auditEvent.ref.tableId || 'N/A'} ` +
                `total=${auditEvent.metadata.totalAmount || 0} ` +
                `timestamp=${auditEvent.timestamp} ` +
                `items=${auditEvent.metadata.itemCount || 0} ` +
                `status=${auditEvent.metadata.status || 'unknown'}`
            );
        }

        return auditEvent;
    }

    getEvents(filters?: {
        limit?: number;
        role?: ActorRole;
        tableId?: string;
        orderId?: string;
        event_type?: AuditEventType;
    }): AuditEvent[] {
        this.loadFromStorage(); // Reload to get latest updates from other tabs
        let filtered = [...this.events];

        if (filters && filters.role) {
            filtered = filtered.filter(e => e.actor_role === filters.role);
        }
        if (filters && filters.tableId) {
            filtered = filtered.filter(e => e.ref.tableId === filters.tableId);
        }
        if (filters && filters.orderId) {
            filtered = filtered.filter(e => e.ref.orderId === filters.orderId);
        }
        if (filters && filters.event_type) {
            filtered = filtered.filter(e => e.event_type === filters.event_type);
        }
        if (filters && filters.limit) {
            filtered = filtered.slice(0, filters.limit);
        }

        return filtered;
    }

    clearEvents(): void {
        this.events = [];
        this.saveToStorage();
        console.log('[AUDIT_STORE] All events cleared');
    }

    getEventCount(): number {
        return this.events.length;
    }
}

// Singleton instance
export const auditStore = new AuditStore();

// Helper to get current actor role (can be enhanced with real auth)
export const getCurrentActorRole = (): ActorRole => {
    // Check for test override
    if (typeof window !== 'undefined') {
        const testRole = sessionStorage.getItem('DEFACTO_TEST_ROLE');
        if (testRole && ['ceo', 'manager', 'staff'].includes(testRole)) {
            return testRole as ActorRole;
        }
    }
    // Default to 'staff'
    return 'staff';
};

export const setTestRole = (role: ActorRole | null) => {
    if (role) {
        sessionStorage.setItem('DEFACTO_TEST_ROLE', role);
    } else {
        sessionStorage.removeItem('DEFACTO_TEST_ROLE');
    }
};
