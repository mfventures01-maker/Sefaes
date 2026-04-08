import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../../types';
import { auditStore, getCurrentActorRole, ActorRole } from '../../services/auditService';
import { paymentIntentStore, PaymentIntent, PaymentStatus } from '../../services/paymentIntentService';

interface PaymentModalProps {
    orderId: string;
    totalAmount: number;
    onClose: () => void;
    onSubmit: (method: PaymentMethod, amount: number, reference?: string, senderName?: string) => void;
    tableId?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ orderId, totalAmount, onClose, onSubmit, tableId }) => {
    const [method, setMethod] = useState<PaymentMethod | null>(null);
    const [reference, setReference] = useState('');
    const [senderName, setSenderName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Payment Gate State
    const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
    const [currentRole, setCurrentRole] = useState<ActorRole>('staff');

    // Initialize Payment Gate
    useEffect(() => {
        const role = getCurrentActorRole();
        setCurrentRole(role);

        // 1. Get or Create Payment Intent
        let intent = paymentIntentStore.getIntentByOrderId(orderId);

        if (!intent) {
            // Create new intent if none exists (Payment Gate Entry)
            intent = paymentIntentStore.createIntent(orderId, tableId || 'unknown', totalAmount);

            // Log creation audit
            auditStore.addEvent({
                event_type: 'payment_intent_created',
                actor_role: role,
                ref: { orderId, tableId: tableId || 'unknown', paymentIntentId: intent.paymentIntentId },
                metadata: { totalAmount, paymentStatus: 'pending' }
            });
        }

        setPaymentIntent(intent);

        // Restore state if already claimed
        if (intent.status === 'claimed' || intent.status === 'verified') {
            if (intent.method) setMethod(intent.method);
        }
    }, [orderId, tableId, totalAmount]);

    // Validation Rules
    const MIN_REF_LENGTH = 6;
    const MIN_SENDER_LENGTH = 3;
    const BLOCKLIST = ['sent', 'transfer', 'paid', 'ok', 'done', 'alert', 'yes', 'money'];

    const cleanRef = reference.trim().toUpperCase().replace(/\s/g, '');
    const isRefBlocked = BLOCKLIST.some(word => cleanRef.includes(word.toUpperCase()));
    const isRefValid = cleanRef.length >= MIN_REF_LENGTH && !isRefBlocked;
    const isSenderValid = senderName.trim().length >= MIN_SENDER_LENGTH;

    const handleMethodSelect = (selectedMethod: PaymentMethod) => {
        if (paymentIntent?.status === 'verified') return; // Locked if verified

        setMethod(selectedMethod);

        // Fire audit event: payment_method_selected
        auditStore.addEvent({
            event_type: 'payment_method_selected',
            actor_role: currentRole,
            ref: {
                orderId,
                tableId: tableId || 'unknown',
                paymentIntentId: paymentIntent?.paymentIntentId
            },
            metadata: {
                paymentMethod: selectedMethod,
                totalAmount
            }
        });
    };

    const handleClaimPayment = () => {
        if (!method || !paymentIntent) return;
        setIsSubmitting(true);

        // 1. Claim Intent
        const updatedIntent = paymentIntentStore.claimIntent(paymentIntent.paymentIntentId, method);
        setPaymentIntent(updatedIntent);

        // 2. Log Audit
        auditStore.addEvent({
            event_type: 'payment_claimed',
            actor_role: currentRole,
            ref: {
                orderId,
                tableId: tableId || 'unknown',
                paymentIntentId: paymentIntent.paymentIntentId
            },
            metadata: {
                paymentMethod: method,
                totalAmount,
                paymentStatus: 'claimed',
                reference: reference || undefined,
                senderName: senderName || undefined
            }
        });

        // 3. Update Legacy System (MockDb) - Treating 'claimed' as 'paid' for legacy compatibility
        // But in Phase 5, true verification happens next.
        onSubmit(method, totalAmount, reference, senderName);

        setIsSubmitting(false);
        onClose();
    };

    const handleVerifyPayment = () => {
        if (!paymentIntent || (currentRole !== 'manager' && currentRole !== 'ceo')) return;
        setIsSubmitting(true);

        // 1. Verify Intent
        const updatedIntent = paymentIntentStore.verifyIntent(paymentIntent.paymentIntentId, currentRole);
        setPaymentIntent(updatedIntent);

        // 2. Log Audit
        auditStore.addEvent({
            event_type: 'payment_verified',
            actor_role: currentRole,
            ref: {
                orderId,
                tableId: tableId || 'unknown',
                paymentIntentId: paymentIntent.paymentIntentId
            },
            metadata: {
                paymentStatus: 'verified',
                verifiedBy: currentRole
            }
        });

        // 3. Print Evidence
        console.log(
            `[TXN_LOG] paymentMethod=${method} tableId=${tableId} ` +
            `total=${totalAmount} timestamp=${new Date().toISOString()} ` +
            `items=${0} status=verified`
        );

        setIsSubmitting(false);
        onClose();
    };

    // Render Logic based on Gate Status
    const isClaimed = paymentIntent?.status === 'claimed';
    const isVerified = paymentIntent?.status === 'verified';
    const canVerify = (currentRole === 'manager' || currentRole === 'ceo') && isClaimed;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-[#0a3d21] w-full max-w-md rounded-3xl p-8 border border-[#c4a45a]/30 shadow-2xl relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c4a45a]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-[#fdfae5] tracking-tight">
                                {isVerified ? 'Payment Verified' : isClaimed ? 'Verify Payment' : 'Record Payment'}
                            </h2>
                            <p className="text-[#c4a45a] text-xs font-bold uppercase tracking-widest mt-1">
                                {isVerified ? 'Settled' : isClaimed ? 'Pending Manager Approval' : `Order #${orderId}`}
                            </p>
                            {paymentIntent?.verificationCode && (
                                <p className="text-[#fdfae5]/40 text-[10px] font-mono mt-1">
                                    Secure Code: {paymentIntent.verificationCode}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-[#fdfae5]/60 text-xs font-bold uppercase tracking-widest">Amount Due</p>
                            <p className="text-3xl font-black text-[#c4a45a]">₦{totalAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    {!method && !isClaimed && !isVerified ? (
                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => handleMethodSelect('POS')} className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl flex items-center justify-between group transition-all">
                                <span className="font-bold text-[#fdfae5] group-hover:translate-x-1 transition-transform">POS Terminal</span>
                                <span className="text-2xl">💳</span>
                            </button>
                            <button onClick={() => handleMethodSelect('TRANSFER')} className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl flex items-center justify-between group transition-all">
                                <span className="font-bold text-[#fdfae5] group-hover:translate-x-1 transition-transform">Bank Transfer</span>
                                <span className="text-2xl">🏦</span>
                            </button>
                            <button onClick={() => handleMethodSelect('CASH')} className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-2xl flex items-center justify-between group transition-all">
                                <span className="font-bold text-[#fdfae5] group-hover:translate-x-1 transition-transform">Cash</span>
                                <span className="text-2xl">💵</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            {!isClaimed && !isVerified && (
                                <button onClick={() => setMethod(null)} className="text-[#c4a45a] text-xs font-bold uppercase flex items-center gap-2 mb-4 hover:opacity-80">
                                    <span>← Back</span>
                                </button>
                            )}

                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <span className="text-[#fdfae5]/60 text-xs font-bold uppercase block mb-1">Method</span>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-[#fdfae5] capitalize">{method}</span>
                                    {isVerified && <span className="text-green-400 font-bold text-xs uppercase border border-green-500/30 px-2 py-1 rounded">Verified</span>}
                                    {isClaimed && !isVerified && <span className="text-amber-400 font-bold text-xs uppercase border border-amber-500/30 px-2 py-1 rounded">Pending</span>}
                                </div>
                            </div>

                            {!isClaimed && !isVerified && method === 'TRANSFER' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[#fdfae5] text-sm font-bold block mb-2">Sender Name</label>
                                        <input
                                            type="text"
                                            value={senderName}
                                            onChange={(e) => setSenderName(e.target.value)}
                                            placeholder="e.g. John Doe"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[#fdfae5] focus:outline-none focus:border-[#c4a45a] transition-colors placeholder:text-white/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#fdfae5] text-sm font-bold block mb-2">Transaction Reference</label>
                                        <input
                                            type="text"
                                            value={reference}
                                            onChange={(e) => setReference(e.target.value)}
                                            placeholder="e.g. REF123456"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[#fdfae5] focus:outline-none focus:border-[#c4a45a] transition-colors placeholder:text-white/20"
                                        />
                                        {isRefBlocked && <p className="text-xs text-red-400 font-bold mt-1">⚠️ Reference is too vague</p>}
                                        {!isRefValid && reference.length > 0 && !isRefBlocked && <p className="text-xs text-[#c4a45a]/80 mt-1">Min 6 characters required</p>}
                                    </div>
                                    <p className="text-xs text-[#c4a45a]/80 mt-2">* Upload screenshot feature simulated for MVP</p>
                                </div>
                            )}

                            {!isClaimed && !isVerified && method === 'POS' && (
                                <div>
                                    <label className="text-[#fdfae5] text-sm font-bold block mb-2">POS Terminal ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        placeholder="e.g. TERMINAL-01"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[#fdfae5] focus:outline-none focus:border-[#c4a45a] transition-colors placeholder:text-white/20"
                                    />
                                </div>
                            )}

                            {!isClaimed && !isVerified && method === 'CASH' && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200 text-sm">
                                    <strong className="block mb-1 font-bold">⚠️ Cash Verification</strong>
                                    Please ensure you have physically received ₦{totalAmount.toLocaleString()} before confirming. This action is logged.
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="pt-4 border-t border-white/10">
                                {canVerify ? (
                                    <button
                                        onClick={handleVerifyPayment}
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-green-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Verifying...' : 'Verify Payment (Manager)'}
                                    </button>
                                ) : !isClaimed && !isVerified ? (
                                    <button
                                        onClick={handleClaimPayment}
                                        disabled={isSubmitting || (method === 'TRANSFER' && (!isRefValid || !isSenderValid))}
                                        className="w-full py-4 bg-[#c4a45a] text-[#0a3d21] rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-[#d4b46a] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Processing...' : 'Recieve Payment'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-white/10 text-[#fdfae5] rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-white/20 transition-all"
                                    >
                                        Close
                                    </button>
                                )}

                                {isClaimed && !canVerify && !isVerified && (
                                    <p className="text-center text-[#fdfae5]/50 text-xs mt-3 italic">
                                        Waiting for Manager verification...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 text-[#fdfae5]/50 hover:text-[#fdfae5] p-2">✕</button>
            </div>
        </div>
    );
};

export default PaymentModal;
