# Manual Test Script: Payment Gateway Hardening (Phase 4)

## Objective
Verify that the payment process is non-bypassable and strictly adheres to the state machine:
`Pending` -> `Claimed` (Staff) -> `Verified` (Manager/CEO) -> `Fulfilled` (Served/Closed).

## Prerequisites
- App running at `http://localhost:5173`
- Chromium Browser (or similar)
- `VITE_DEBUG_ROLE_SWITCH=true` (if testing RBAC via UI)

---

## Test Scenario 1: The "Handoff" Flow (WhatsApp/Telegram)

1.  **Guest Actions**:
    - Open `http://localhost:5173/q/T1`.
    - Add items to cart (e.g., Suya, Cocktail).
    - Open Cart.
    - Click **WhatsApp**.
    - **Verify**:
        - URL opens with pre-filled message.
        - Message contains `Order ID: ...` and `Code: ...` (6-char alphanumeric).
    - **Console Log Check**:
        - `[AUDIT] event=payment_intent_created`
        - `[AUDIT] event=channel_selected` (WhatsApp)

2.  **Staff Dashboard Check**:
    - Open `http://localhost:5173/dashboard`.
    - Look for the new order.
    - **Verify Status**:
        - Payment Status: **UNPAID** or **PENDING** (Orange/Red).
        - "Mark Served" button is **DISABLED** (Red/Grey).

---

## Test Scenario 2: The "Staff Claim" Flow

1.  **Staff Actions**:
    - On Dashboard, click **Record Pay** (Green button) for the order.
    - **Payment Modal Opens**:
    - Select **Bank Transfer**.
    - Enter `Sender Name` and `Reference`.
    - Click **Recieve Payment**.
    - **Verify**:
        - Modal closes.
        - Dashboard updates immediately.
        - Payment Status: **PENDING VERIFICATION** (Amber/Pulse).
        - "Mark Served" button is **STILL DISABLED**.
    - **Console Log Check**:
        - `[AUDIT] event=payment_claimed`

---

## Test Scenario 3: The "Manager Verification" Flow

1.  **Manager Actions**:
    - Switch Role to **Manager** (top header or debug switch).
    - Locate the order with **PENDING VERIFICATION** status.
    - **Verify**:
        - A **VERIFY** button appears in the "Action" column (Dashboard) or "Record Pay" button changes to "VERIFY NOW" (Service Pipeline).
    - Click **VERIFY**.
    - **Verify**:
        - Status changes to **VERIFIED** (Green).
        - "Mark Served" button becomes **ENABLED** (Purple).
    - **Console Log Check**:
        - `[AUDIT] event=payment_verified` actor_role=manager.

---

## Test Scenario 4: Fulfillment (The "Happy Path")

1.  **Staff/Manager Actions**:
    - Click **Mark Served**.
    - **Verify**: Order status updates to "served".
    - Click **Close Table**.
    - **Verify**: Order moves to history / table becomes free.

---

## Test Scenario 5: Attempted Bypass (Security Check)

1.  **Staff Actions**:
    - Try to click "Mark Served" on an **UNPAID** order.
    - **Expected Result**: Nothing happens (Button disabled/greyed out).
    - Try to click "Mark Served" on a **CLAIMED** (but not verified) order.
    - **Expected Result**: Nothing happens (Button disabled).
    - Try to verify payment as **Staff** (if UI allows it via bug).
    - **Expected Result**: Button should not be visible or should be disabled. API/Store should reject if role != manager/ceo.

---

## Final Audit Check

1.  **CEO Dashboard**:
    - Switch to **CEO** role.
    - Open Audit Panel.
    - **Verify Sequence**:
        1. `payment_intent_created`
        2. `payment_claimed`
        3. `payment_verified`
        4. [`order_fulfilled` - if implemented in future hook, currently logic is in button click]

---
**Status**: Ready for QA.
