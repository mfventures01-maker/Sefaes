
export interface Dish {
  id: string;
  name: string;
  description: string;
  prompt: string;
  price: number;
  category: 'food' | 'drink' | 'cocktail';
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderData {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  selectedProducts: string;
  quantityPerProduct: string;
  totalAmount: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  promise: string;
  benefit: string;
  icon: string;
}


export interface ValueProp {
  text: string;
}

// CARSS Types
export type PaymentMethod = 'POS' | 'Cash' | 'Transfer';

export interface OrderContext {
  table?: number;
  zone?: string;
  contextSetAt: number; // timestamp
}

export interface OrderConfirmation {
  orderId: string;
  context: OrderContext;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: number;
}

// --- DEFACTO LOUNGE MODE TYPES ---

export type ZoneType = 'VIP' | 'Regular' | 'Outdoor' | 'Poolside';
export type OrderStatus = 'created' | 'accepted' | 'preparing' | 'ready' | 'served' | 'closed' | 'voided';
export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'verified' | 'rejected';
export type Department = 'Bar' | 'Kitchen' | 'Hookah';

export interface Table {
  id: string;
  name: string;
  zone: ZoneType;
  capacity?: number;
  status: 'idle' | 'occupied' | 'service_required';
}

export interface OrderItem extends CartItem {
  department: Department;
  status: 'pending' | 'served';
  voidReason?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  currency: 'NGN'; // Explicit currency
  referenceCode?: string; // POS RRN or Transfer Ref
  senderName?: string; // For transfers
  evidenceUrl?: string;
  status: PaymentStatus;
  verifiedBy?: string; // CEO user id
  verifiedAt?: number;
  timestamp: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  totalPaid: number; // Tracked amount
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  payments: Payment[]; // Associated payments
  notes?: string;
  createdBy: string; // 'qr_guest' or staff_id
  createdAt: number;
  updatedAt: number;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: number;
  entityId?: string; // orderId or paymentId
}

export interface MockSession {
  role: 'guest' | 'staff' | 'ceo';
  userId: string;
  name: string;
  activeTableId?: string; // For guests
}
// ... existing types ...

export type Role = 'staff' | 'ceo' | 'manager';

export type VerificationReason =
  | 'BANK_ALERT_MATCH'
  | 'BANK_APP_CONFIRM'
  | 'CUSTOMER_CALL_CONFIRM'
  | 'MANUAL_OVERRIDE'
  | 'POS_RECEIPT_MATCH';

export interface LedgerEntry {
  id: string; // Unique Ledger ID (LED-...)
  trackingId: string; // CARSS id
  orderId: string;
  tableId: string;
  staffId: string; // Actor who initiated this state
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  timestamp: number;
  metadata?: {
    posReference?: string;
    verificationReason?: VerificationReason;
    notes?: string;
    editorId?: string; // If verified by someone else
    previousStatus?: PaymentStatus;
    idempotencyKey?: string;
  };
}

// ... existing types ...
