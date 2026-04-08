import React from 'react';

interface StaffPortalSectionProps {
    onNavigateToDashboard: () => void;
}

const StaffPortalSection: React.FC<StaffPortalSectionProps> = ({ onNavigateToDashboard }) => {
    return (
        <section className="py-16 px-6 bg-gradient-to-b from-defacto-green to-defacto-black border-t border-defacto-gold/20">
            <div className="max-w-4xl mx-auto text-center">
                {/* Title */}
                <div className="mb-8">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-defacto-cream mb-3">
                        Staff Portal
                    </h2>
                    <p className="text-lg text-defacto-cream/70">
                        CEO / Manager / Staff dashboards
                    </p>
                </div>

                {/* CTA Button */}
                <button
                    onClick={onNavigateToDashboard}
                    className="group relative overflow-hidden bg-defacto-gold text-defacto-black px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-2xl hover:shadow-defacto-gold/50 hover:scale-105 transition-all duration-300"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                        </svg>
                        Open Dashboard
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-defacto-gold to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* Small Text */}
                <p className="mt-6 text-xs text-defacto-cream/40 uppercase tracking-widest">
                    For authorized staff only
                </p>
            </div>
        </section>
    );
};

export default StaffPortalSection;
