import React, { useState, useMemo } from 'react';
import { foodMenuItems, FoodMenuItem } from '../../data/foodMenu';

const FoodMenuSection: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<'All' | 'Local' | 'Intercontinental' | 'Seafood'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        let items = foodMenuItems;

        // Filter by tag
        if (activeFilter !== 'All') {
            items = items.filter(item => item.tags.includes(activeFilter));
        }

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
        }

        return items;
    }, [activeFilter, searchQuery]);

    const categories: Array<'All' | 'Local' | 'Intercontinental' | 'Seafood'> = [
        'All', 'Local', 'Intercontinental', 'Seafood'
    ];

    return (
        <section id="food-menu" className="py-20 px-6 bg-gradient-to-b from-defacto-green to-defacto-black">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-5xl md:text-6xl font-serif font-bold text-defacto-cream mb-4">
                        Food Menu
                    </h2>
                    <p className="text-lg text-defacto-cream/70 max-w-2xl mx-auto">
                        From exotic Nigerian flavors to intercontinental classics. Every dish is a journey.
                    </p>
                </div>

                {/* Search */}
                <div className="mb-8 max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-defacto-gold/30 bg-white/10 backdrop-blur-sm focus:border-defacto-gold focus:outline-none text-defacto-cream placeholder:text-defacto-cream/40 transition-colors"
                    />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 justify-center mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeFilter === cat
                                    ? 'bg-defacto-gold text-defacto-black shadow-lg shadow-defacto-gold/50 scale-105'
                                    : 'bg-white/10 backdrop-blur-sm border-2 border-defacto-cream/30 text-defacto-cream hover:border-defacto-gold hover:text-defacto-gold'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 text-defacto-cream/50">
                        <p className="text-lg font-medium">No dishes found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <FoodMenuCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

// Individual Food Menu Card Component
interface FoodMenuCardProps {
    item: FoodMenuItem;
}

const FoodMenuCard: React.FC<FoodMenuCardProps> = ({ item }) => {
    const [imageError, setImageError] = useState(false);

    const getTagColor = (tag: string) => {
        const colors: Record<string, string> = {
            Local: 'bg-green-600',
            Intercontinental: 'bg-blue-600',
            Seafood: 'bg-cyan-600'
        };
        return colors[tag] || 'bg-gray-600';
    };

    return (
        <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-defacto-cream/10 shadow-lg hover:shadow-2xl hover:shadow-defacto-gold/20 hover:scale-105 transition-all duration-300">
            {/* Image or Fallback */}
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-defacto-gold/10 to-defacto-cream/5">
                {!imageError ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-defacto-gold/30 to-orange-600/30 flex flex-col items-center justify-center p-6 text-defacto-cream">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-80">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                        </svg>
                        <span className="text-sm font-bold uppercase tracking-widest">Premium Dish</span>
                    </div>
                )}

                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags.map(tag => (
                        <span
                            key={tag}
                            className={`px-2 py-1 ${getTagColor(tag)} text-white text-xs font-bold uppercase tracking-wider rounded-full`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <h3 className="text-xl font-serif font-bold text-defacto-cream mb-2 leading-tight">
                    {item.name}
                </h3>
                <p className="text-sm text-defacto-cream/70 mb-4 line-clamp-2">
                    {item.description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-defacto-gold">
                        ₦{item.price.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-defacto-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
    );
};

export default FoodMenuSection;
