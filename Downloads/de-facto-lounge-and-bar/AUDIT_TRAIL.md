# AUDIT TRAIL SYSTEM - Phase 4 (Hardening)

## Overview

The De Facto Lounge & Bar audit trail system tracks all critical user actions in real-time, providing CEO-level visibility into order creation, payment method selection, and checkout completion events. Phase 4 introduces strict payment gates and role-based verification to prevent fraud and ensures no order is fulfilled without a verified payment intent.

---

## Payment Gate Hardening

Phase 4 enforces a **Non-Bypassable Payment Gate**:

1.  **Creation**: A unique `PaymentIntent` is created immediately when payment is initiated or an order is placed via WhatsApp/Telegram.
2.  **Claiming**: Staff must "Claim" a payment method (POS/Transfer/Cash). This locks the intent state but does NOT mark it as paid.
3.  **Verification**: Managers or CEOs must explicitly "Verify" the payment. Only `verified` intents allow the order to be fulfilled ("Served" or "Table Closed").
4.  **Audit**: Every state transition is logged immutably.

---

## Event Types

The system now tracks extended event types for granular security:

### 1. `payment_intent_created`
**Fired when**: Payment flow initiates (Modal open or WhatsApp/Telegram order)
**Location**: `components/payment/PaymentModal.tsx` / `TableLanding.tsx`
**Metadata**: `totalAmount`, `paymentStatus: 'pending'`

### 2. `payment_claimed`
**Fired when**: Staff selects a payment method and submits details.
**Location**: `components/payment/PaymentModal.tsx`
**Actor**: Staff
**Metadata**: `paymentMethod`, `reference`, `senderName`, `paymentStatus: 'claimed'`

### 3. `payment_verified`
**Fired when**: Manager/CEO confirms receipt of funds.
**Location**: `components/payment/PaymentModal.tsx` or `Dashboard.tsx`
**Actor**: Manager / CEO
**Metadata**: `verifiedBy`, `paymentStatus: 'verified'`

### 4. `order_fulfilled`
**Fired when**: Order is marked as "Served" or "Table Closed".
**Constraint**: **Blocked** unless payment is `verified`.
**Location**: `components/dashboard/ServicePipeline.tsx`

### 5. `channel_selected` / `message_opened` / `handoff_completed`
**Fired when**: Guest chooses WhatsApp/Telegram (Handoff Flow).
**Location**: `components/ordering/TableLanding.tsx`
**Metadata**: `channel` (WhatsApp/Telegram), `verificationCode`

---

## Legacy Events (Retained)

### `order_created`
**Fired when**: Guest places legacy cart order.

### `payment_method_selected`
**Fired when**: User toggles method in modal (pre-submission).

### `checkout_completed`
**Fired when**: Legacy checkout success (now typically paired with `payment_claimed`).

---

## Role-Based Access Control (RBAC) rules

| Action | Staff | Manager | CEO |
| :--- | :---: | :---: | :---: |
| Create Order | ✅ | ✅ | ✅ |
| Create Payment Intent | ✅ | ✅ | ✅ |
| **Claim Payment** | ✅ | ✅ | ✅ |
| **Verify Payment** | ❌ | ✅ | ✅ |
| **Serve Order** | ❌ (Blocked*) | ✅ | ✅ |
| View Audit Trail | ❌ | ❌ | ✅ |

*\*Serve Order is blocked for everyone until payment is verified.*

---

## Storage & Implementation

### Storage Key
`defacto_audit_events_v1` (localStorage)

### Data Model
```typescript
interface AuditEvent {
  id: string;
  event_type: AuditEventType;
  actor_role: ActorRole;
  ref: {
    orderId?: string;
    tableId?: string;
    paymentIntentId?: string; // New field
  };
  timestamp: string;
  metadata?: {
    verificationCode?: string; // Anti-fraud code
    verifiedBy?: string;
    paymentStatus?: 'pending' | 'claimed' | 'verified';
    [key: string]: any;
  };
}
```

---

## Viewing & Testing

### CEO Dashboard
1.  Navigate to `/dashboard`.
2.  Toggle role to **CEO** (debug mode).
3.  Audit Panel shows real-time stream of all events.
4.  Filter by "Payment Intents" or "Verifications" to see the hardening in action.

### Verification Flow Test
1.  **Staff**: Open Payment Modal -> Select Transfer -> Enter details -> Click "Recieve Payment". (Event: `payment_claimed`)
2.  **Dashboard**: See status "PENDING VERIFICATION". Order cannot be served.
3.  **Manager**: Click "VERIFY" button on Dashboard (or Modal). (Event: `payment_verified`)
4.  **System**: Status becomes "VERIFIED". "Mark Served" button unlocks.

---

## Summary of Changes

- **Phase 4** introduces the **PaymentIntent** state machine.
- Audit trail now acts as the "Black Box" recorder for all financial transitions.
- Front-line staff are empowered to *record* (Claim) but restricted from *settling* (Verify).
- Integration with external channels (WhatsApp) is now auditable and traceable via `verificationCode`.
