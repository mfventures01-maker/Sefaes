import React, { useState } from 'react';
import { OrderItem, PaymentMethod } from '../../types';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: OrderItem[];
    tableId: string;
    onConfirm: (method: PaymentMethod, notes: string, posReference?: string) => void;
    onWhatsApp: (method: PaymentMethod, notes: string) => void;
    onTelegram: (method: PaymentMethod, notes: string) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    cart,
    tableId,
    onConfirm,
    onWhatsApp,
    onTelegram
}) => {
    const [method, setMethod] = useState<PaymentMethod>('POS');
    const [notes, setNotes] = useState('');
    const [posReference, setPosReference] = useState('');

    if (!isOpen) return null;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const canSubmit = method !== 'POS' || (method === 'POS' && posReference.length > 3);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-[#fdfae5] h-full flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-6 bg-[#0a3d21] text-[#fdfae5] flex justify-between items-center shadow-lg">
                    <div>
                        <h2 className="font-black text-xl italic tracking-tight">Checkout</h2>
                        <span className="text-xs text-[#c4a45a] uppercase tracking-widest">Table {tableId}</span>
                    </div>
                    <button onClick={onClose} className="text-[#c4a45a] hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Order Summary */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#0a3d21]/60 mb-4 border-b border-[#0a3d21]/10 pb-2">Order Summary</h3>
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <div className="flex gap-2">
                                        <span className="font-bold text-[#0a3d21]">{item.quantity}x</span>
                                        <span className="text-[#0a3d21]">{item.name}</span>
                                    </div>
                                    <span className="font-mono text-[#0a3d21]">₦{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-4 border-t border-[#0a3d21]/20 mt-4">
                                <span className="font-black text-lg text-[#0a3d21] uppercase">Total</span>
                                <span className="font-black text-2xl text-[#c4a45a]">₦{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </section>

                    {/* Payment Method */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#0a3d21]/60 mb-4 border-b border-[#0a3d21]/10 pb-2">Payment Method</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {(['POS', 'Transfer', 'Cash'] as PaymentMethod[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMethod(m)}
                                    className={`py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-wider transition-all
                                        ${method === m
                                            ? 'bg-[#0a3d21] border-[#0a3d21] text-[#fdfae5] shadow-lg scale-105'
                                            : 'border-[#0a3d21]/10 text-[#0a3d21] hover:bg-black/5'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-[#0a3d21]/60 mt-2 italic">
                            {method === 'POS' && "Pay with card using our terminal."}
                            {method === 'Transfer' && "Send to our Fidelity Bank account. Verification required."}
                            {method === 'Cash' && "Pay cash to your server."}
                        </p>
                    </section>

                    {/* POS Reference (Conditional) */}
                    {method === 'POS' && (
                        <section className="animate-in slide-in-from-top duration-300">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#0a3d21]/60 mb-4 border-b border-[#0a3d21]/10 pb-2">POS Reference (Required)</h3>
                            <input
                                type="text"
                                value={posReference}
                                onChange={(e) => setPosReference(e.target.value)}
                                placeholder="Enter Receipt No. / Ref Code"
                                className="w-full bg-white border border-[#0a3d21]/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#c4a45a] font-mono"
                            />
                        </section>
                    )}

                    {/* Notes */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#0a3d21]/60 mb-4 border-b border-[#0a3d21]/10 pb-2">Notes</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Allergies, special requests..."
                            className="w-full bg-white border border-[#0a3d21]/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[#c4a45a] min-h-[80px]"
                        />
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-[#0a3d21]/10 space-y-3">
                    <button
                        onClick={() => onConfirm(method, notes, posReference)}
                        disabled={!canSubmit}
                        className="w-full py-4 bg-[#c4a45a] text-[#0a3d21] rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-[#d4b46a] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Place Order
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onWhatsApp(method, notes)}
                            className="py-3 bg-[#25D366] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-[#20bd5a] active:scale-95 transition-all"
                        >
                            <span>WhatsApp</span>
                        </button>
                        <button
                            onClick={() => onTelegram(method, notes)}
                            className="py-3 bg-[#0088cc] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-[#0077b5] active:scale-95 transition-all"
                        >
                            <span>Telegram</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
