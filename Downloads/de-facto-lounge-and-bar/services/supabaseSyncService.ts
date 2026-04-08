
import { supabase } from '../lib/supabaseClient';
import { auditStore, AuditEvent } from './auditService';

// The fixed Business ID for De Facto Lounge (should match what is in the DB)
// In a real app, this might come from an auth context or config
const DE_FACTO_BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

export class SupabaseSyncService {
    private isSyncing = false;
    private syncInterval: NodeJS.Timer | null = null;

    constructor() {
        // Auto-start sync if configured
        if (import.meta.env.VITE_SUPABASE_URL) {
            this.startSync();
        }
    }

    startSync(intervalMs = 30000) {
        if (this.syncInterval) return;
        console.log('[SYNC] Starting Supabase sync service...');
        this.syncInterval = setInterval(() => this.syncPendingEvents(), intervalMs);
    }

    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    async syncPendingEvents() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            // 1. Get local events that might need syncing
            // For now, we'll just look at the most recent events from auditStore
            // In a robust system, we'd track 'synced' status in the AuditStore itself
            const localEvents = auditStore.getEvents({ limit: 50 }); // Just grab last 50

            // 2. Filter for 'checkout_completed' events that aren't yet in Supabase
            // (Simplification: We just try to insert and ignore duplicates if ID is unique)

            const transactionEvents = localEvents.filter(e => e.event_type === 'checkout_completed');

            for (const event of transactionEvents) {
                await this.pushTransactionToSupabase(event);
            }

        } catch (error) {
            console.error('[SYNC] Error during sync cycle:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    private async pushTransactionToSupabase(event: AuditEvent) {
        // Map AuditEvent to Supabase Schema
        const { metadata, ref, timestamp } = event;

        // Skip if already synced (naive check)
        // In reality, we should check a 'synced_at' flag on the local event

        const payload = {
            business_id: DE_FACTO_BUSINESS_ID,
            client_signature: 'anonymous-guest', // We'd hash real client info here
            experience_timestamp: timestamp,
            total_amount: metadata?.totalAmount || 0,
            currency: 'USD',
            discretion_level: 10, // Default high discretion
            payment_method: metadata?.paymentMethod || 'unknown',
            payment_intent_id: ref.paymentIntentId,
            items: metadata?.items || [],
            // ... map other fields
            created_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('defacto_transactions')
            .insert(payload);

        if (error) {
            console.error('[SYNC] Failed to push transaction:', error);
        } else {
            console.log('[SYNC] Successfully pushed transaction:', event.id);
        }
    }
}

export const supabaseSyncService = new SupabaseSyncService();
