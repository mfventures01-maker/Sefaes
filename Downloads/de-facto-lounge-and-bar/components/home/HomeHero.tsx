import React, { useState, useEffect } from 'react';

interface HomeHeroProps {
    onScrollToBar: () => void;
    onScrollToFood: () => void;
    onOpenReservation: () => void;
    onScrollToChapman: () => void;
}

const SLIDES = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1570554520913-ce2847ef5555?q=80&w=2000',
        alt: 'VIP Lounge Ambience',
        title: 'De Facto',
        subtitle: 'Lounge & Bar',
        desc: "Asaba's premier destination for curated spirits and quiet sophistication.",
        accent: 'text-defacto-gold'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=2000',
        alt: 'Signature Cocktails',
        title: 'Curated',
        subtitle: 'Mixology',
        desc: 'Experience the art of the perfect pour.',
        accent: 'text-red-400'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1544025162-d7669d26d405?q=80&w=2000',
        alt: 'Gourmet Platter',
        title: 'Exquisite',
        subtitle: 'Dining',
        desc: 'Culinary masterpieces crafted for the discerning palate.',
        accent: 'text-orange-400'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2000',
        alt: 'Fresh Mojito',
        title: 'Refresh',
        subtitle: '& Revive',
        desc: 'Zesty, cold, and perfectly balanced.',
        accent: 'text-green-400'
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=2000',
        alt: 'Premium Bottles',
        title: 'Top Shelf',
        subtitle: 'Selection',
        desc: 'Only the finest reserves for our VIP guests.',
        accent: 'text-defacto-gold'
    }
];

const HomeHero: React.FC<HomeHeroProps> = ({
    onScrollToBar,
    onScrollToFood,
    onOpenReservation,
    onScrollToChapman
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(SLIDES.length).fill(false));

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleImageLoad = (index: number) => {
        setImagesLoaded(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
        });
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* Carousel Background */}
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                    {/* Fallback Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-defacto-black via-defacto-green/20 to-black ${imagesLoaded[index] ? 'hidden' : 'block'}`} />

                    <img
                        src={slide.image}
                        alt={slide.alt}
                        className="w-full h-full object-cover opacity-60"
                        onLoad={() => handleImageLoad(index)}
                        onError={(e) => {
                            // Fallback if image fails
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-defacto-black via-defacto-black/50 to-transparent" />
                </div>
            ))}

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
                {/* Content */}
                <div className="mb-12">
                    {SLIDES.map((slide, index) => (
                        <div key={slide.id} className={`${index === currentSlide ? 'block animate-fade-in-up' : 'hidden'}`}>
                            <h1 className="text-6xl md:text-8xl font-serif font-bold text-defacto-cream tracking-tight leading-none mb-4 drop-shadow-2xl">
                                {slide.title}
                            </h1>
                            <p className={`text-3xl md:text-5xl font-serif italic ${slide.accent} mb-6`}>
                                {slide.subtitle}
                            </p>
                            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
                                {slide.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons - Persistent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto backdrop-blur-sm bg-black/30 p-4 rounded-3xl border border-white/10">
                    <button
                        onClick={onScrollToBar}
                        className="group relative overflow-hidden bg-defacto-gold text-defacto-black px-8 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-all"
                    >
                        <span>Explore Bar</span>
                    </button>

                    <button
                        onClick={onScrollToFood}
                        className="group relative overflow-hidden bg-white/10 text-white border border-white/20 px-8 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                        <span>Food Menu</span>
                    </button>

                    <button
                        onClick={onOpenReservation}
                        className="md:col-span-2 group relative overflow-hidden bg-defacto-green text-white border border-defacto-gold/30 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-defacto-green/80 transition-all"
                    >
                        <span>Book a VIP Table</span>
                    </button>

                    <button
                        onClick={onScrollToChapman}
                        className="md:col-span-2 text-xs text-defacto-gold/70 hover:text-defacto-gold uppercase tracking-widest"
                    >
                        View Chapman Menu
                    </button>
                </div>

                {/* Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {SLIDES.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-defacto-gold w-6' : 'bg-white/30'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
export default HomeHero;
