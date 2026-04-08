import React from 'react';

interface ExperienceHighlightsProps {
    onScrollToBar: () => void;
    onScrollToFood: () => void;
    onOpenReservation: () => void;
}

const ExperienceHighlights: React.FC<ExperienceHighlightsProps> = ({
    onScrollToBar,
    onScrollToFood,
    onOpenReservation
}) => {
    const highlights = [
        {
            id: 'bar',
            title: 'Premium Bar',
            description: 'Rare spirits and signature cocktails crafted by master mixologists',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
                </svg>
            ),
            action: onScrollToBar,
            gradient: 'from-purple-600 to-indigo-700'
        },
        {
            id: 'restaurant',
            title: 'Exquisite Cuisine',
            description: 'From local delicacies to intercontinental masterpieces',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                </svg>
            ),
            action: onScrollToFood,
            gradient: 'from-orange-600 to-red-700'
        },
        {
            id: 'reserve',
            title: 'VIP Experience',
            description: 'Reserve your table and enjoy personalized service',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
            action: onOpenReservation,
            gradient: 'from-emerald-600 to-teal-700'
        }
    ];

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-defacto-black to-defacto-green">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-defacto-cream mb-4">
                        The De Facto Experience
                    </h2>
                    <p className="text-lg text-defacto-cream/70 max-w-2xl mx-auto">
                        Three pillars of excellence. One unforgettable destination.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {highlights.map(highlight => (
                        <button
                            key={highlight.id}
                            onClick={highlight.action}
                            className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-defacto-cream/10 hover:border-defacto-gold hover:scale-105 transition-all duration-300 text-left overflow-hidden"
                        >
                            {/* Gradient background on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${highlight.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                            <div className="relative z-10">
                                <div className="text-defacto-gold mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {highlight.icon}
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-defacto-cream mb-3">
                                    {highlight.title}
                                </h3>
                                <p className="text-defacto-cream/70 mb-6">
                                    {highlight.description}
                                </p>
                                <span className="inline-flex items-center gap-2 text-defacto-gold font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                                    Explore
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ExperienceHighlights;
