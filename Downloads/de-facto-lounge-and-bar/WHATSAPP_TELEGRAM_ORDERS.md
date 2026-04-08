# WHATSAPP & TELEGRAM ORDER PLACEMENT

## Overview

Guests can now place orders through **three channels**:
1. **In-App** (original flow) - Direct order placement through the web app
2. **WhatsApp** - Send order details via WhatsApp to staff
3. **Telegram** - Send order details via Telegram to staff

This provides flexibility for guests who prefer messaging apps over the web interface.

---

## How It Works

### Guest Experience

1. **Browse Menu** at `/q/T1` (or any table)
2. **Add Items** to cart
3. **Open Cart** (floating cart button)
4. **Choose Ordering Method**:
   - **Confirm Order** (Green button) - Places order in-app
   - **WhatsApp** (Green button with 📱) - Opens WhatsApp with pre-filled message
   - **Telegram** (Blue button with ✈️) - Opens Telegram with pre-filled message

### Message Format

Both WhatsApp and Telegram send a formatted message:

```
🍽️ New Order from Table 1

2x Jollof Rice - ₦5,000
1x Chapman - ₦2,500
3x Suya Platter - ₦12,000

Total: ₦19,500

Please confirm this order.
```

---

## Configuration

### WhatsApp Setup

**File**: `constants.tsx`

```typescript
export const WHATSAPP_CONFIG = {
  targetNumber: '2348000000000', // Update with actual De Facto WhatsApp number
  businessName: 'De Facto Lounge & Bar'
};
```

**Steps**:
1. Get your business WhatsApp number (format: country code + number, no spaces or +)
2. Update `targetNumber` in `constants.tsx`
3. Example: For +234 800 000 0000, use `'2348000000000'`

### Telegram Setup

**File**: `constants.tsx`

```typescript
export const TELEGRAM_CONFIG = {
  botUsername: 'defactolounge', // Update with actual Telegram bot username or channel
  businessName: 'De Facto Lounge & Bar'
};
```

**Steps**:
1. Create a Telegram bot via [@BotFather](https://t.me/botfather)
   - Send `/newbot` to BotFather
   - Follow prompts to create bot
   - Get bot username (e.g., `defactolounge_bot`)
2. **OR** Create a Telegram channel
   - Create public channel
   - Get channel username (e.g., `defactolounge`)
3. Update `botUsername` in `constants.tsx` (without @ symbol)

---

## Technical Implementation

### Files Modified

1. **`components/ordering/TableLanding.tsx`**
   - Added `handleWhatsAppOrder()` function
   - Added `handleTelegramOrder()` function
   - Updated cart UI with 3 ordering buttons

2. **`constants.tsx`**
   - Added `TELEGRAM_CONFIG` constant

### URL Formats

**WhatsApp**:
```
https://wa.me/{PHONE_NUMBER}?text={ENCODED_MESSAGE}
```

**Telegram**:
```
https://t.me/{BOT_USERNAME}?text={ENCODED_MESSAGE}
```

### Message Encoding

Messages are URL-encoded:
- `%0A` = Line break
- `*text*` = Bold (WhatsApp only)
- Spaces and special characters are automatically encoded

---

## User Flow

### In-App Order (Original)
```
Cart → Confirm Order → Order Created → Staff Dashboard → Payment Modal → Checkout
```

### WhatsApp Order (New)
```
Cart → WhatsApp Button → Opens WhatsApp → Guest sends message → Staff receives → Manual processing
```

### Telegram Order (New)
```
Cart → Telegram Button → Opens Telegram → Guest sends message → Staff receives → Manual processing
```

---

## Benefits

### For Guests
- ✅ **Choice**: Pick their preferred communication method
- ✅ **Familiar**: Use apps they already know
- ✅ **Offline-friendly**: Can send order even with poor connection
- ✅ **Record**: Message history serves as order confirmation

### For Staff
- ✅ **Flexibility**: Receive orders through multiple channels
- ✅ **Backup**: If web app has issues, orders still come through
- ✅ **Communication**: Can reply to guests directly for clarifications

---

## Limitations & Considerations

### WhatsApp Orders
- ⚠️ **Manual Entry**: Staff must manually enter order into system
- ⚠️ **No Auto-Audit**: These orders don't trigger audit events automatically
- ⚠️ **Verification**: Staff should confirm order with guest before processing

### Telegram Orders
- ⚠️ **Bot Required**: Needs Telegram bot or channel setup
- ⚠️ **Manual Entry**: Same as WhatsApp
- ⚠️ **Less Common**: Not all guests may have Telegram

### Recommendations
1. **Primary Method**: Encourage in-app orders for full audit trail
2. **Fallback**: Use WhatsApp/Telegram when web app is unavailable
3. **Staff Training**: Train staff to manually log WhatsApp/Telegram orders
4. **Future Enhancement**: Build bot to auto-parse and create orders

---

## Testing

### Test WhatsApp Integration

1. Navigate to `http://localhost:3000/q/T1`
2. Add items to cart
3. Open cart
4. Click **WhatsApp** button
5. Verify:
   - ✅ WhatsApp opens (web or app)
   - ✅ Message is pre-filled
   - ✅ Table name is correct
   - ✅ Items and prices are formatted
   - ✅ Total is accurate

### Test Telegram Integration

1. Navigate to `http://localhost:3000/q/T1`
2. Add items to cart
3. Open cart
4. Click **Telegram** button
5. Verify:
   - ✅ Telegram opens (web or app)
   - ✅ Message is pre-filled
   - ✅ Bot/channel username is correct
   - ✅ Items and prices are formatted
   - ✅ Total is accurate

---

## Mobile Behavior

### iOS
- WhatsApp button opens WhatsApp app (if installed) or WhatsApp Web
- Telegram button opens Telegram app (if installed) or Telegram Web

### Android
- WhatsApp button opens WhatsApp app (if installed) or WhatsApp Web
- Telegram button opens Telegram app (if installed) or Telegram Web

### Desktop
- Both buttons open web versions (web.whatsapp.com, web.telegram.org)

---

## Future Enhancements

### Phase 5+ Ideas

1. **Telegram Bot Integration**
   - Auto-parse incoming messages
   - Create orders automatically
   - Send confirmation back to guest
   - Trigger audit events

2. **WhatsApp Business API**
   - Official WhatsApp Business integration
   - Template messages
   - Order status updates
   - Payment links

3. **Order Tracking**
   - Send order number via message
   - Guest can check status
   - Notifications when ready

4. **Analytics**
   - Track which channel guests prefer
   - Conversion rates by channel
   - Response time metrics

---

## Deployment Checklist

Before going live:

- [ ] Update `WHATSAPP_CONFIG.targetNumber` with real business number
- [ ] Test WhatsApp number works (send test message)
- [ ] Create Telegram bot or channel
- [ ] Update `TELEGRAM_CONFIG.botUsername` with real bot/channel
- [ ] Test Telegram bot/channel works
- [ ] Train staff on handling WhatsApp/Telegram orders
- [ ] Create process for manually logging these orders
- [ ] Add signage/instructions for guests on how to use

---

## Support

### Common Issues

**WhatsApp button does nothing**:
- Check `WHATSAPP_CONFIG.targetNumber` is correct format
- Ensure no spaces or special characters in number
- Try opening WhatsApp Web manually first

**Telegram button does nothing**:
- Check `TELEGRAM_CONFIG.botUsername` is correct
- Ensure bot/channel exists and is public
- Try opening Telegram Web manually first

**Message not pre-filled**:
- Check URL encoding in browser console
- Verify cart has items
- Check message format in code

---

## Configuration Quick Reference

```typescript
// constants.tsx

export const WHATSAPP_CONFIG = {
  targetNumber: '2348000000000',  // ← UPDATE THIS
  businessName: 'De Facto Lounge & Bar'
};

export const TELEGRAM_CONFIG = {
  botUsername: 'defactolounge',   // ← UPDATE THIS
  businessName: 'De Facto Lounge & Bar'
};
```

**Remember**: No `+` or `@` symbols in config values!

---

**Feature Status**: ✅ **IMPLEMENTED & TESTED**  
**Build Status**: ✅ **SUCCESSFUL**  
**Ready for**: Production deployment (after config update)
