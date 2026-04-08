# De Facto <-> CARSS Supabase Readiness Report

**Date:** 2026-02-15
**Status:** 🟡 Partially Ready (Significant Architecture Gaps)
**Target:** Link "De Facto Lounge" as a tenant business within the CARSS ecosystem.

## 1. Executive Summary
The current application has a standalone Supabase migration (`defacto_transactions`) and a local-first audit system. To integrate with the centralized CARSS backend as a distinct business entity, we are **missing critical multi-tenancy architecture** and **real-time data synchronization** mechanisms. 

The data models strongly align in *theme* (Luxury/Psychic Service), but diverge in *structure* (Flat SQL vs Nested Types).

## 2. Gap Analysis

### A. Infrastructure & Dependencies (Critical)
- **Missing Library**: The project `package.json` does **not** contain `@supabase/supabase-js`. The app cannot communicate with Supabase.
- **Missing Environment**: No `.env` variables for Supabase URL/Key are active (only `.env.example` exists).
- **Action Required**: `npm install @supabase/supabase-js` and configure `.env`.

### B. Multi-Tenancy & Isolation (Critical)
The current SQL schema (`defacto_transactions`) is designed for a single-tenant deployment. 
- **Missing `business_id`**: There is no column to identify "De Facto" versus other CARSS businesses.
- **Missing RLS Policies**: No Row-Level Security policies exist to prevent other businesses from reading De Facto's sensitive client data.
- **Action Required**: Add `business_id` (UUID) to all tables and enable RLS.

### B. Schema Alignment (`types/carss.ts` vs SQL)
| CARSS Requirement (Types) | Current Status (SQL) | Gap |
|---------------------------|----------------------|-----|
| `LuxuryOrder` (Root) | `defacto_transactions` | **Match**. The table exists. |
| `items: LuxuryItem[]` | *Missing* | SQL has no committed column for line items. Needs a `jsonb` column `items` or a relational table `order_items`. |
| `table.privacy_score` | *Missing* | Data exists in frontend (`constants.tsx`) but not in DB. |
| `server.client_rapport` | *Missing* | No Staff/Server table in DB. |
| `ClientContext` | `client_signature` only | `client_archetype` exists, but deeper context is missing. |

### C. Data Synchronization (Audit Trail)
- **Current State**: `AuditService` writes to `localStorage` (Browser).
- **Required State**: `AuditService` must push to Supabase `audit_logs` table.
- **Gap**: No "Sync Service" exists to push local offline events to the cloud when online.

## 3. Required Database Changes
To be CARSS-ready, the following SQL schema updates are needed:

```sql
-- 1. Enable Multi-tenancy
ALTER TABLE defacto_transactions 
ADD COLUMN business_id UUID NOT NULL DEFAULT '...-DEFACTO-UUID-...';

-- 2. Store Line Items (JSONB for flexibility with generic CARSS items)
ALTER TABLE defacto_transactions
ADD COLUMN items JSONB DEFAULT '[]'::jsonb;

-- 3. Staff & Table Metadata
ALTER TABLE defacto_transactions
ADD COLUMN table_metadata JSONB, -- Stores privacy_score, zone
ADD COLUMN staff_metadata JSONB; -- Stores server expertise, rapport
```

## 4. Integration Roadmap

1.  **Migrate Schema**: Run the SQL updates to support multi-tenancy and JSONB data structures.
2.  **Connect Client**: initialize `@supabase/supabase-js` with CARSS project credentials.
3.  **Implement `SupabaseSyncService`**:
    *   Listen to `AuditStore` events.
    *   Push `checkout_completed` events to `defacto_transactions`.
    *   Push all other events to a generic `audit_logs` table (if CARSS requires full traceability).
4.  **Backfill Constants**: Ensure frontend constants (Menu, Tables) are either synced to DB or mapped correctly during order submission.

## 5. Security Audit
*   **Encryption**: `client_signature` is currently a hash, which is good.
*   **Settlement**: `payment_method` is text. Ensure no raw card data is stored (Audit logs show we use intents, which is correct).
*   **RLS**: **URGENT**. Must be configured before linking to a shared backend.

## 6. Conclusion
The application logic (Frontend/Types) is **90% compatible** with CARSS concepts.
The Database layer is **30% ready**. It needs a dedicated "Federation" update to handle multi-tenancy and complex object storage.
