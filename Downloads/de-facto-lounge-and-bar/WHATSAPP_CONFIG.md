# WhatsApp Configuration Guide

## Numbers to Update

All WhatsApp numbers are currently set to placeholder: `2348000000000`

### Files to Update

#### 1. `data/staff.ts`
**Line 72**: Concierge contact number
```typescript
export const CONCIERGE_CONTACT = {
    whatsappNumber: '2348000000000', // ← UPDATE THIS
    name: 'De Facto Concierge',
    defaultMessage: 'Hello! I would like to speak with the concierge about...'
};
```

#### 2. `components/home/ReserveTableModal.tsx`
**Line 26**: Reservation WhatsApp number
```typescript
const whatsappNumber = '2348000000000'; // ← UPDATE THIS
```

#### 3. `components/home/HomeFooter.tsx`
**Line 7**: General contact WhatsApp number
```typescript
const whatsappNumber = '2348000000000'; // ← UPDATE THIS
```

#### 4. `constants.tsx`
**Line 85**: Main business WhatsApp number
```typescript
export const WHATSAPP_CONFIG = {
    targetNumber: '2348000000000', // ← UPDATE THIS
    businessName: 'De Facto Lounge & Bar'
};
```

---

## Quick Update Script

Run this PowerShell command to find all instances:
```powershell
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String "2348000000000" | Select-Object Path, LineNumber
```

Or use Find & Replace in your editor:
- **Find**: `2348000000000`
- **Replace**: `234XXXXXXXXXX` (your actual number)

---

## Format

WhatsApp numbers should be in international format without `+`:
- ✅ Correct: `2348012345678`
- ❌ Wrong: `+234 801 234 5678`
- ❌ Wrong: `08012345678`

---

## Testing

After updating, test each WhatsApp link:
1. Reserve Table modal → Should open WhatsApp with pre-filled message
2. Staff section → "Contact Concierge" button
3. Footer → "Contact Us" button
4. QR ordering flow → Existing WhatsApp integration

---

## Bank Details

Also update in `constants.tsx` (Line 89-94):
```typescript
export const BANK_DETAILS = {
    bankName: 'First Bank of Nigeria', // ← UPDATE
    accountName: 'De Facto Lounge & Bar', // ← UPDATE
    accountNumber: '1234567890', // ← UPDATE
    note: 'Use your Order ID as payment reference'
};
```
