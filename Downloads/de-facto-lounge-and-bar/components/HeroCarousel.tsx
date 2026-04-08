
import React, { useState, useEffect } from 'react';
import { WHATSAPP_CONFIG } from '../constants';

interface HeroSlide {
    id: string;
    title: string;
    description: string;
    image: string;
    ctaPrimary: { text: string; action: () => void };
    ctaSecondary?: { text: string; link: string };
}

interface HeroCarouselProps {
    onCategorySelect: (category: 'Bar' | 'Kitchen') => void;
    onBookTable: () => void;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ onCategorySelect, onBookTable }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Using Unsplash placeholders as requested since no local assets were found in immediate directories
    const slides: HeroSlide[] = [
        {
            id: 'bar',
            title: 'Bar',
            description: 'Premium spirits & signature cocktails.',
            image: 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            ctaPrimary: { text: 'Order Drinks', action: () => onCategorySelect('Bar') },
            ctaSecondary: { text: 'WhatsApp Concierge', link: `https://wa.me/${WHATSAPP_CONFIG.targetNumber}` }
        },
        {
            id: 'restaurant',
            title: 'Restaurant',
            description: 'Exquisite African & Intercontinental cuisine.',
            image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            ctaPrimary: { text: 'View Menu', action: () => onCategorySelect('Kitchen') },
            ctaSecondary: { text: 'WhatsApp Concierge', link: `https://wa.me/${WHATSAPP_CONFIG.targetNumber}` }
        },
        {
            id: 'vip',
            title: 'Reserved Table',
            description: 'Exclusive VIP bookings for the perfect night out.',
            image: 'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            ctaPrimary: { text: 'Book VIP Table', action: onBookTable },
            ctaSecondary: { text: 'WhatsApp Concierge', link: `https://wa.me/${WHATSAPP_CONFIG.targetNumber}` }
        }
    ];

    useEffect(() => {
        if (!isPaused) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [isPaused, slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div
            className="relative h-[60vh] w-full overflow-hidden bg-[#051f11] isolate group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Background Image */}
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#051f11] via-[#051f11]/60 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end pb-20 px-6 md:px-12 text-center md:text-left items-center md:items-start max-w-4xl mx-auto md:mx-0">
                        <h2 className="text-4xl md:text-6xl font-black text-[#fdfae5] font-serif mb-2 tracking-tight drop-shadow-lg">
                            {slide.title}
                        </h2>
                        <p className="text-lg md:text-xl text-[#c4a45a] font-medium mb-8 max-w-lg drop-shadow-md">
                            {slide.description}
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <button
                                onClick={slide.ctaPrimary.action}
                                className="px-8 py-4 bg-[#c4a45a] text-[#051f11] font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#fdfae5] transition-all shadow-xl active:scale-95"
                            >
                                {slide.ctaPrimary.text}
                            </button>
                            {slide.ctaSecondary && (
                                <a
                                    href={slide.ctaSecondary.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 border border-[#fdfae5]/30 text-[#fdfae5] font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#fdfae5]/10 backdrop-blur-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {/* Whatsapp Icon */}
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.654-.698c1.09.587 1.83.674 2.805.674 3.167 0 5.769-2.586 5.769-5.786 0-3.199-2.581-5.841-5.768-5.841zm0 10.37c-.772 0-1.465-.405-2.222-.843l-1.353.355.361-1.325c-.477-.736-.78-1.528-.78-2.388 0-2.479 2.015-4.496 4.494-4.496 2.479 0 4.495 2.019 4.495 4.5.378-2.618-1.564-4.803-4.495-4.803zm1.688-6.176c-.198-.101-.65-.181-1.002-.081-.252.071-.462.292-.612.453-.162.171-.787.876-.877 1.268-.09.393-.05.938.403 1.585.503.717 1.554 1.886 2.575 2.169 1.631.451 1.571.162 2.064-.09.303-.153.645-.536.756-.908.111-.373.081-.726.03-.897-.05-.171-.242-.252-.445-.353-.202-.102-1.936-.856-1.936-.856s-.202-.152-.394.133l-.535.666c-.192.231-.343.191-.586.071-.242-.121-1.01-.525-1.585-1.272-.445-.576-.081-.697.121-.908.172-.182.263-.303.394-.495.131-.192.071-.354-.03-.495-.101-.141-1.503-2.604-1.464-2.503z" />
                                    </svg>
                                    <span>Concierge</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all border border-[#fdfae5]/50 ${index === currentSlide ? 'bg-[#c4a45a] scale-125' : 'bg-[#fdfae5]/30 hover:bg-[#fdfae5]/60'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Arrows */}
            <button
                onClick={prevSlide}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/20 text-[#fdfae5] hover:bg-[#c4a45a] hover:text-[#051f11] backdrop-blur-sm transition-all z-20 active:scale-95"
                aria-label="Previous slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <button
                onClick={nextSlide}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/20 text-[#fdfae5] hover:bg-[#c4a45a] hover:text-[#051f11] backdrop-blur-sm transition-all z-20 active:scale-95"
                aria-label="Next slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
};

export default HeroCarousel;
