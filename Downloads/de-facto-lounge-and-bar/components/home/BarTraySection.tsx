import React, { useState, useMemo } from 'react';
import { barTrayItems, BarTrayItem } from '../../data/barTray';

const BarTraySection: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<'All' | 'Cognac' | 'Whisky' | 'Bourbon' | 'Vodka' | 'Champagne' | 'Cocktail'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        let items = barTrayItems;

        // Filter by category
        if (activeFilter !== 'All') {
            items = items.filter(item => item.category === activeFilter);
        }

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.tastingNote.toLowerCase().includes(query)
            );
        }

        return items;
    }, [activeFilter, searchQuery]);

    const categories: Array<'All' | 'Cognac' | 'Whisky' | 'Bourbon' | 'Vodka' | 'Champagne' | 'Cocktail'> = [
        'All', 'Cognac', 'Whisky', 'Bourbon', 'Vodka', 'Champagne', 'Cocktail'
    ];

    return (
        <section id="bar-tray" className="py-20 px-6 bg-defacto-cream">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-5xl md:text-6xl font-serif font-bold text-defacto-green mb-4">
                        Bar Tray
                    </h2>
                    <p className="text-lg text-defacto-green/70 max-w-2xl mx-auto">
                        Curated spirits and signature cocktails. From rare cognacs to house-crafted masterpieces.
                    </p>
                </div>

                {/* Search */}
                <div className="mb-8 max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="Search drinks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-defacto-green/20 bg-white focus:border-defacto-gold focus:outline-none text-defacto-green placeholder:text-defacto-green/40 transition-colors"
                    />
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 justify-center mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeFilter === cat
                                    ? 'bg-defacto-green text-defacto-cream shadow-lg scale-105'
                                    : 'bg-white border-2 border-defacto-green/20 text-defacto-green hover:border-defacto-gold hover:text-defacto-gold'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 text-defacto-green/50">
                        <p className="text-lg font-medium">No items found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredItems.map(item => (
                            <BarTrayCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

// Individual Bar Tray Card Component
interface BarTrayCardProps {
    item: BarTrayItem;
}

const BarTrayCard: React.FC<BarTrayCardProps> = ({ item }) => {
    const [imageError, setImageError] = useState(false);

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Cognac: 'from-amber-600 to-orange-700',
            Whisky: 'from-yellow-700 to-amber-800',
            Bourbon: 'from-orange-600 to-red-700',
            Vodka: 'from-blue-400 to-cyan-500',
            Champagne: 'from-yellow-300 to-amber-400',
            Cocktail: 'from-pink-500 to-purple-600'
        };
        return colors[category] || 'from-gray-600 to-gray-800';
    };

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-defacto-green/10 shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-300">
            {/* Image or Fallback */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-defacto-green/5 to-defacto-gold/5">
                {!imageError ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(item.category)} flex flex-col items-center justify-center p-6 text-white`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-80">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
                        </svg>
                        <span className="text-sm font-bold uppercase tracking-widest">{item.category}</span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-defacto-black/80 backdrop-blur-sm text-defacto-gold text-xs font-bold uppercase tracking-wider rounded-full">
                        {item.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-serif font-bold text-defacto-green mb-2 leading-tight">
                    {item.name}
                </h3>
                <p className="text-sm text-defacto-green/60 mb-4 line-clamp-2 italic">
                    {item.tastingNote}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-defacto-gold">
                        ₦{item.price.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-defacto-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
    );
};

export default BarTraySection;
