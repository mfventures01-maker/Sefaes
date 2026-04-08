# Payment Pipeline Stress Test Harness

## Overview
This harness validates the integrity of the DeFacto payment pipeline (CASH, POS, TRANSFER) and enforces security rules (CEO Verification) locally before shipping.

## How to Run Locally
1. Ensure dev server is running:
   ```bash
   npm run dev
   ```
2. Navigate to the hidden test route with the flag:
   `http://localhost:5173/__stress?testMode=1`

## Test Coverage (7 Scenarios)
| ID | Name | Coverage |
|----|------|----------|
| T1 | Staff Login Gate | Verifies unauthenticated users cannot access Staff/CEO dashboards. |
| T2 | CASH Flow | Creates 10 CASH orders. Verifies instant verification. Checks Dashboard totals. |
| T3 | POS Flow | Creates 10 POS orders. Verifies they start as PENDING. |
| T4 | TRANSFER Flow | Creates 10 Transfers. CEO verifies 5, Rejects 5. Checks totals match verified only. |
| T5 | Idempotency | Submits duplicate payments. Verifies only 1 is recorded. |
| T6 | Concurrency | Simulates 20 concurrent transactions. Verifies no data loss. |
| T7 | Tamper Attempt | Staff attempts to verify a TRANSFER. Expects SECURITY FAILURE. |

## Ship Readiness Report
To generate the Ship Report:
1. Click **RUN ALL TESTS** in the UI.
2. Wait for completion.
3. Open Browser Console (F12) to view the JSON report.
4. The report is also saved to `localStorage.getItem("STRESS_TEST_LAST_REPORT")`.

### Netlify Deployment Checklist
- [ ] Build Command: `npm run build`
- [ ] Publish Directory: `dist`
- [ ] `netlify.toml` exists with SPA redirect `/* /index.html 200`
- [ ] Environment Variables set (if applicable)

## Implementation Details
- **Location**: `components/stress/*`
- **Data Layer**: `services/mockDatabase.ts` (Hardened with Idempotency & Security checks)
- **Auth**: `services/auditService.ts` (Enhanced with Test Role overrides)

## Known Limitations
- Backend verification is simulated via `mockDatabase` logic.
- "Build Output" check in UI is manual as frontend cannot access filesystem.
