import React, { useState } from 'react';
import { mockDb } from '../../services/mockDatabase';

interface CartPageProps {
    tableId: string;
    cart: any[];
    setCart: React.Dispatch<React.SetStateAction<any[]>>;
    navigateToMenu: () => void;
    navigateToSuccess: (orderId: string, name: string, phone: string, method: string) => void;
}

const CartPage: React.FC<CartPageProps> = ({ tableId, cart, setCart, navigateToMenu, navigateToSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [method, setMethod] = useState<'cash' | 'pos'>('pos');
    const [loading, setLoading] = useState(false);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === id) return { ...i, quantity: Math.max(0, i.quantity + delta) };
            return i;
        }).filter(i => i.quantity > 0));
    };

    const handleCheckout = async () => {
        if (!name || !phone) {
            alert('Please enter your name and phone number');
            return;
        }
        setLoading(true);
        try {
            // Mock API call to create order & payment intent
            const order = await mockDb.createOrder(tableId, cart, 'qr_guest');
            // Normally you would call your /api/payment-intent endpoint here
            const orderId = order.id;

            // Clear Cart
            setCart([]);
            navigateToSuccess(orderId, name, phone, method);
        } catch (error) {
            alert('Checkout failed.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#051f11] text-[#fdfae5] p-6 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-black mb-4">Your Cart is Empty</h2>
                <button onClick={navigateToMenu} className="bg-[#c4a45a] text-[#051f11] px-6 py-3 rounded-xl font-bold uppercase">Back to Menu</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#051f11] text-[#fdfae5] p-6 pb-24 font-sans">
            <button onClick={navigateToMenu} className="text-[#c4a45a] font-bold uppercase text-sm mb-6">&larr; Back to Menu</button>
            <h1 className="text-3xl font-black mb-6 tracking-tighter">Your Order</h1>

            <div className="space-y-4 mb-8">
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                        <div>
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-[#c4a45a] text-sm font-bold">₦{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-black border border-white/20 rounded-lg p-1">
                            <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 font-bold">-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 font-bold">+</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-8 p-4 border-t border-white/20">
                <div className="flex justify-between text-xl font-black">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <h2 className="text-xl font-bold">Your Information</h2>
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#fdfae5] text-[#051f11] p-4 rounded-xl font-bold" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#fdfae5] text-[#051f11] p-4 rounded-xl font-bold" />
            </div>

            <div className="space-y-4 mb-8">
                <h2 className="text-xl font-bold">Payment Method</h2>
                <div className="flex gap-4">
                    <button onClick={() => setMethod('pos')} className={`flex-1 p-4 rounded-xl font-bold uppercase transition-all ${method === 'pos' ? 'bg-[#c4a45a] text-[#051f11]' : 'border border-white/20'}`}>POS Card</button>
                    <button onClick={() => setMethod('cash')} className={`flex-1 p-4 rounded-xl font-bold uppercase transition-all ${method === 'cash' ? 'bg-[#c4a45a] text-[#051f11]' : 'border border-white/20'}`}>Transfer / Cash</button>
                </div>
            </div>

            <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#c4a45a] text-[#051f11] py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Complete Order'}
            </button>
        </div>
    );
};

export default CartPage;
