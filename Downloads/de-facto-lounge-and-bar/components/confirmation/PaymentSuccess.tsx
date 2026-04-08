import React from 'react';
import { generateWhatsAppMessage, generateTelegramMessage } from '../../services/notificationService';
import { WHATSAPP_CONFIG, TELEGRAM_CONFIG } from '../../constants';

interface PaymentSuccessProps {
    tableId: string;
    orderContext: any; // { orderId, name, phone, method, items, total }
    navigateToMenu: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ tableId, orderContext, navigateToMenu }) => {
    if (!orderContext) return null;

    const waLink = generateWhatsAppMessage(
        WHATSAPP_CONFIG.targetNumber,
        tableId,
        orderContext.name,
        orderContext.phone,
        orderContext.items,
        orderContext.total,
        orderContext.method,
        orderContext.orderId
    );

    const tgLink = generateTelegramMessage(
        TELEGRAM_CONFIG.botUsername,
        tableId,
        orderContext.name,
        orderContext.phone,
        orderContext.items,
        orderContext.total,
        orderContext.method,
        orderContext.orderId
    );

    return (
        <div className="min-h-screen bg-[#051f11] text-[#fdfae5] p-6 flex flex-col items-center justify-center font-sans">
            <div className="w-24 h-24 bg-[#c4a45a] rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-[#051f11]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 className="text-3xl font-black mb-2 tracking-tighter">Order Sent!</h1>
            <p className="text-[#c4a45a] font-bold uppercase tracking-widest mb-8">Order #{orderContext.orderId.substring(0, 8)}</p>

            <div className="bg-white/5 border border-white/20 p-6 rounded-2xl w-full max-w-md mb-8">
                <p className="text-sm mb-4">Please notify the staff via WhatsApp or Telegram to ensure your order begins preparation immediately.</p>

                <a href={waLink} target="_blank" rel="noreferrer" className="block w-full bg-green-500 text-white text-center py-4 rounded-xl font-bold mb-4 uppercase tracking-widest hover:bg-green-600 transition-all">
                    Notify via WhatsApp
                </a>

                <a href={tgLink} target="_blank" rel="noreferrer" className="block w-full bg-blue-500 text-white text-center py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">
                    Notify via Telegram
                </a>
            </div>

            <button onClick={navigateToMenu} className="text-[#c4a45a] font-bold uppercase text-sm underline pb-12">Return to Menu</button>
        </div>
    );
};

export default PaymentSuccess;
