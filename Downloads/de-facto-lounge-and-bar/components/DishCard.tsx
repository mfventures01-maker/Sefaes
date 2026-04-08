
import React, { useState, useEffect } from 'react';
import { Dish } from '../types';
import { generateImage, isGeminiEnabled } from '../services/geminiService';

interface DishCardProps {
  dish: Dish;
  onAddToCart: () => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, onAddToCart }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const geminiAvailable = isGeminiEnabled();

  useEffect(() => {
    const loadImage = async () => {
      if (!geminiAvailable) {
        setLoading(false);
        setImageUrl(null);
        return;
      }
      setLoading(true);
      const url = await generateImage(dish.prompt);
      setImageUrl(url);
      setLoading(false);
    };
    loadImage();
  }, [dish.prompt, geminiAvailable]);

  return (
    <div className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-[#0a3d21]/10 flex flex-col h-full cursor-pointer">
      <div className="aspect-[4/5] relative overflow-hidden bg-[#0a3d21]/5">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#0a3d21]/20 border-t-[#c4a45a] rounded-full animate-spin"></div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a3d21]/5 to-[#c4a45a]/5 flex items-center justify-center text-[#0a3d21]/40 text-center p-6">
            <div>
              <div className="text-4xl mb-2">{dish.category === 'food' ? '🍽️' : '🍸'}</div>
              <p className="text-xs font-bold uppercase tracking-wider">{!geminiAvailable ? 'Image Preview' : 'Visualizing...'}</p>
            </div>
          </div>
        )}
        <div className="absolute top-5 left-5">
          <span className="px-4 py-1.5 bg-[#0a3d21] text-[#fdfae5] text-[10px] font-extrabold rounded-full uppercase tracking-[0.2em] shadow-lg">
            {dish.category === 'food' ? 'Kitchen' : 'Bar'}
          </span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-[#0a3d21] group-hover:text-[#c4a45a] transition-colors leading-tight">{dish.name}</h3>
        </div>
        <p className="text-sm text-[#0a3d21]/70 leading-relaxed line-clamp-2 mb-8 font-medium italic">{dish.description}</p>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-black text-[#0a3d21]">₦{dish.price.toLocaleString()}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="w-full py-4 bg-[#0a3d21] text-[#fdfae5] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black active:scale-[0.97] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#0a3d21]/20"
          >
            <span>ADD TO ORDER</span>
            <span className="text-lg leading-none">＋</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
