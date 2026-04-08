import { Payment, PaymentMethod, PaymentStatus, LedgerEntry, Role, VerificationReason, Order } from '../types';
import { mockDb } from './mockDatabase';
import { auditStore } from './auditService';
import { authService } from './authService';

const LEDGER_STORAGE_KEY = 'defacto_ledger_v1';

class LedgerService {
    private entries: LedgerEntry[] = [];

    constructor() {
        this.loadLedger();
    }

    private loadLedger() {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem(LEDGER_STORAGE_KEY);
        this.entries = stored ? JSON.parse(stored) : [];
    }

    private saveLedger() {
        localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(this.entries));
    }

    // --- Core Ledger Operations ---

    async createPaymentIntent(params: {
        orderId: string;
        tableId: string;
        method: PaymentMethod;
        amount: number;
        staffId: string;
        notes?: string;
        posReference?: string;
        idempotencyKey?: string;
    }): Promise<LedgerEntry> {
        const { orderId, tableId, method, amount, staffId, notes, posReference, idempotencyKey } = params;

        // 1. STATE MACHINE CHECK
        let initialStatus: PaymentStatus = 'pending';

        if (method === 'Cash') {
            initialStatus = 'paid';
        } else if (method === 'POS') {
            if (!posReference) throw new Error('POS Transactions require a reference/receipt number.');
            initialStatus = 'pending';
        } else if (method === 'Transfer') {
            initialStatus = 'pending';
        }

        // 2. CREATE IN MOCK DB (UI Visibility)
        // We pass posReference as reference (idempotency in mockDb works on reference code)
        const payment = await mockDb.addPayment(
            orderId,
            method,
            amount,
            posReference || idempotencyKey, // Use posReference or provided key for mockDb idempotency
            undefined,
            staffId
        );

        // 3. CREATE LEDGER ENTRY (Append Start)
        // We use payment.id as the trackingId to link them 1:1
        const entry: LedgerEntry = {
            id: `LED-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            trackingId: payment.id,
            orderId,
            tableId,
            staffId,
            amount,
            method,
            status: initialStatus,
            timestamp: Date.now(),
            metadata: {
                posReference,
                notes,
                idempotencyKey
            }
        };

        this.entries.push(entry);
        this.saveLedger();

        // 4. SYNC STATUS IF NEEDED
        if (initialStatus === 'paid') {
            await mockDb.verifyPayment(payment.id, 'SYSTEM_AUTO_CASH', true);
        }

        // 5. AUDIT LOG
        auditStore.addEvent({
            event_type: 'payment_submitted',
            actor_role: 'staff',
            ref: { orderId, tableId, paymentIntentId: payment.id },
            metadata: {
                method,
                amount,
                status: initialStatus,
                posRef: posReference
            }
        });

        return entry;
    }

    async verifyTransaction(
        trackingId: string, // This is the Payment ID
        actorRole: Role,
        actorId: string,
        isApproved: boolean,
        reason?: VerificationReason
    ): Promise<LedgerEntry> {

        // 1. FIND LATEST STATE
        // We need the *latest* entry for this trackingId to check current status
        const history = this.entries.filter(e => e.trackingId === trackingId);
        if (history.length === 0) throw new Error('Transaction Not Found in Ledger');

        // Sort by timestamp desc
        const latestEntry = history.sort((a, b) => b.timestamp - a.timestamp)[0];

        // 2. SECURITY GATE (Role Check)
        if (actorRole !== 'ceo' && actorRole !== 'manager') {
            throw new Error('SECURITY_VIOLATION: Only CEO/Manager can verify transactions.');
        }

        // 3. STATE TRANSITION CHECK
        // Must be PENDING to be Verified/Rejected
        if (latestEntry.status !== 'pending') {
            throw new Error(`ILLEGAL_TRANSITION: Cannot verify transaction in state ${latestEntry.status}`);
        }

        // 4. CREATE NEW LEDGER ENTRY (Append State Change)
        const newStatus: PaymentStatus = isApproved ? 'verified' : 'rejected';

        const newEntry: LedgerEntry = {
            ...latestEntry,
            id: `LED-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            staffId: actorId, // The verifier becomes the actor of this new state entry
            status: newStatus,
            timestamp: Date.now(),
            metadata: {
                ...latestEntry.metadata,
                verificationReason: reason,
                editorId: actorId,
                previousStatus: latestEntry.status
            }
        };

        this.entries.push(newEntry);
        this.saveLedger();

        // 5. SYNC MOCK DB
        await mockDb.verifyPayment(trackingId, actorId, isApproved);

        // 6. AUDIT LOG
        auditStore.addEvent({
            event_type: isApproved ? 'payment_verified' : 'payment_rejected',
            actor_role: actorRole,
            ref: { orderId: latestEntry.orderId, tableId: latestEntry.tableId, paymentIntentId: trackingId },
            metadata: {
                reason,
                oldStatus: 'pending',
                newStatus
            }
        });

        return newEntry;
    }

    // --- Read Operations ---

    getPendingTransactions() {
        const latestInfo = new Map<string, LedgerEntry>();

        this.entries.forEach(entry => {
            const existing = latestInfo.get(entry.trackingId);
            if (!existing || entry.timestamp > existing.timestamp) {
                latestInfo.set(entry.trackingId, entry);
            }
        });

        return Array.from(latestInfo.values()).filter(e => e.status === 'pending');
    }

    getLedgerHistory() {
        return this.entries;
    }

    calculateDidacticTotals() {
        const latestInfo = new Map<string, LedgerEntry>();
        this.entries.forEach(entry => {
            const existing = latestInfo.get(entry.trackingId);
            if (!existing || entry.timestamp > existing.timestamp) {
                latestInfo.set(entry.trackingId, entry);
            }
        });

        const uniqueTx = Array.from(latestInfo.values());
        const today = new Date().setHours(0, 0, 0, 0);

        const validTx = uniqueTx.filter(t => t.timestamp >= today && (t.status === 'verified' || t.status === 'paid'));
        const pendingTx = uniqueTx.filter(t => t.status === 'pending');
        const rejectedTx = uniqueTx.filter(t => t.status === 'rejected');

        return {
            totalVolume: validTx.reduce((sum, t) => sum + t.amount, 0),
            count: validTx.length,
            breakdown: {
                cash: validTx.filter(t => t.method === 'Cash').reduce((sum, t) => sum + t.amount, 0),
                pos: validTx.filter(t => t.method === 'POS').reduce((sum, t) => sum + t.amount, 0),
                transfer: validTx.filter(t => t.method === 'Transfer').reduce((sum, t) => sum + t.amount, 0),
            },
            pendingCount: pendingTx.length,
            pendingVolume: pendingTx.reduce((sum, t) => sum + t.amount, 0),
            rejectedCount: rejectedTx.length
        };
    }
}

export const ledgerService = new LedgerService();
