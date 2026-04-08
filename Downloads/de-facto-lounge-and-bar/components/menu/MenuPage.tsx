import React, { useState, useEffect } from 'react';
import { INITIAL_MENU } from '../../constants';

interface MenuPageProps {
    tableId: string;
    cart: any[];
    setCart: React.Dispatch<React.SetStateAction<any[]>>;
    navigateToCart: () => void;
}

const MenuPage: React.FC<MenuPageProps> = ({ tableId, cart, setCart, navigateToCart }) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    const addToCart = (dish: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === dish.id);
            if (existing) {
                return prev.map(i => i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...dish, quantity: 1, status: 'pending' }];
        });
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const filteredMenu = INITIAL_MENU.filter(item => {
        const matchesCategory = category === 'All' || item.category === category || (category === 'Food' && (item.category !== 'drink' && item.category !== 'cocktail'));
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#051f11] text-[#fdfae5] p-6 pb-24 font-sans">
            <h1 className="text-3xl font-black mb-2 tracking-tighter">Table {tableId}</h1>
            <p className="text-[#c4a45a] mb-6 font-bold uppercase tracking-widest text-sm">Digital Menu</p>

            <input
                type="text"
                placeholder="Search food & drinks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#fdfae5] text-[#051f11] p-4 rounded-xl mb-6 font-bold"
            />

            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
                {['All', 'Food', 'drink', 'cocktail'].map(c => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-4 py-2 rounded-lg font-bold capitalize whitespace-nowrap ${category === c ? 'bg-[#c4a45a] text-[#051f11]' : 'border border-[#c4a45a] text-[#c4a45a]'}`}
                    >
                        {c === 'drink' ? 'Drinks' : c}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMenu.map(item => (
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                        <div>
                            {/* Upsell / Best Seller highlight */}
                            {item.price > 50000 && <span className="bg-[#c4a45a] text-[#051f11] text-[10px] font-black uppercase px-2 py-1 rounded inline-block mb-2">Best Seller &bull; Premium</span>}
                            <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                            <p className="text-white/60 text-sm mb-4 h-10 overflow-hidden">{item.description}</p>
                            <p className="text-[#c4a45a] font-black text-lg mb-4">₦{item.price.toLocaleString()}</p>
                        </div>
                        <button
                            onClick={() => addToCart(item)}
                            className="bg-white/10 hover:bg-[#c4a45a] hover:text-[#051f11] text-white py-3 rounded-xl font-bold uppercase tracking-widest transition-all"
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>

            {cartCount > 0 && (
                <div className="fixed bottom-6 left-6 right-6 z-40">
                    <button
                        onClick={navigateToCart}
                        className="w-full bg-[#c4a45a] text-[#051f11] py-4 rounded-2xl shadow-2xl flex justify-between items-center px-6 font-black uppercase tracking-widest"
                    >
                        <span>{cartCount} Items</span>
                        <span>View Cart</span>
                        <span>₦{cartTotal.toLocaleString()}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default MenuPage;
