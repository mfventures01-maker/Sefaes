// Payment Intent Service - Phase 5 (Payment Gate Hardening)
// Manages payment intents as non-bypassable gates for order fulfillment

export type PaymentMethod = 'CASH' | 'POS' | 'TRANSFER';
export type PaymentStatus = 'pending' | 'claimed' | 'verified' | 'expired' | 'voided';

export interface PaymentIntent {
    paymentIntentId: string;
    orderId: string;
    tableId: string;
    amount: number;
    method?: PaymentMethod;
    status: PaymentStatus;
    created_at: string; // ISO
    verified_at?: string; // ISO
    verified_by_role?: 'manager' | 'ceo';
    verificationCode: string; // 6-char code for anti-fraud
}

const STORAGE_KEY = 'defacto_payment_intents_v1';

class PaymentIntentStore {
    private intents: PaymentIntent[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.intents = JSON.parse(stored);
            }
        } catch (error) {
            console.error('[PAYMENT_INTENT_STORE] Failed to load from localStorage:', error);
            this.intents = [];
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.intents));
        } catch (error) {
            console.error('[PAYMENT_INTENT_STORE] Failed to save to localStorage:', error);
        }
    }

    private generateVerificationCode(): string {
        // Generate 6-character alphanumeric code
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    createIntent(orderId: string, tableId: string, amount: number): PaymentIntent {
        const intent: PaymentIntent = {
            paymentIntentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            orderId,
            tableId,
            amount,
            status: 'pending',
            created_at: new Date().toISOString(),
            verificationCode: this.generateVerificationCode()
        };

        this.intents.unshift(intent); // Add to beginning
        this.saveToStorage();

        console.log(
            `[PAYMENT_INTENT] created paymentIntentId=${intent.paymentIntentId} ` +
            `orderId=${orderId} amount=${amount} verificationCode=${intent.verificationCode}`
        );

        return intent;
    }

    updateIntent(paymentIntentId: string, updates: Partial<PaymentIntent>): PaymentIntent | null {
        const index = this.intents.findIndex(i => i.paymentIntentId === paymentIntentId);
        if (index === -1) {
            console.error(`[PAYMENT_INTENT] Intent not found: ${paymentIntentId}`);
            return null;
        }

        this.intents[index] = { ...this.intents[index], ...updates };
        this.saveToStorage();

        console.log(
            `[PAYMENT_INTENT] updated paymentIntentId=${paymentIntentId} ` +
            `status=${this.intents[index].status} method=${this.intents[index].method || 'N/A'}`
        );

        return this.intents[index];
    }

    claimIntent(paymentIntentId: string, method: PaymentMethod): PaymentIntent | null {
        return this.updateIntent(paymentIntentId, {
            method,
            status: 'claimed'
        });
    }

    verifyIntent(paymentIntentId: string, verifiedByRole: 'manager' | 'ceo'): PaymentIntent | null {
        const intent = this.getIntent(paymentIntentId);
        if (!intent) return null;

        if (intent.status !== 'claimed') {
            console.error(`[PAYMENT_INTENT] Cannot verify intent in status: ${intent.status}`);
            return null;
        }

        return this.updateIntent(paymentIntentId, {
            status: 'verified',
            verified_at: new Date().toISOString(),
            verified_by_role: verifiedByRole
        });
    }

    getIntent(paymentIntentId: string): PaymentIntent | null {
        this.loadFromStorage(); // Reload to get latest updates from other tabs
        return this.intents.find(i => i.paymentIntentId === paymentIntentId) || null;
    }

    getIntentByOrderId(orderId: string): PaymentIntent | null {
        this.loadFromStorage(); // Reload to get latest updates from other tabs
        const intent = this.intents.find(i => i.orderId === orderId);
        return intent || null;
    }

    getIntents(filters?: {
        status?: PaymentStatus;
        tableId?: string;
        orderId?: string;
        limit?: number;
    }): PaymentIntent[] {
        this.loadFromStorage(); // Reload to get latest updates from other tabs
        let filtered = [...this.intents];

        if (filters && filters.status) {
            filtered = filtered.filter(i => i.status === filters.status);
        }
        if (filters && filters.tableId) {
            filtered = filtered.filter(i => i.tableId === filters.tableId);
        }
        if (filters && filters.orderId) {
            filtered = filtered.filter(i => i.orderId === filters.orderId);
        }
        if (filters && filters.limit) {
            filtered = filtered.slice(0, filters.limit);
        }

        return filtered;
    }

    isPaymentVerified(orderId: string): boolean {
        const intent = this.getIntentByOrderId(orderId);
        return intent?.status === 'verified';
    }

    clearIntents(): void {
        this.intents = [];
        this.saveToStorage();
        console.log('[PAYMENT_INTENT_STORE] All intents cleared');
    }
}

// Singleton instance
export const paymentIntentStore = new PaymentIntentStore();
