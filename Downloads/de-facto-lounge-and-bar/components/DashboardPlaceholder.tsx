import React from 'react';

const DashboardPlaceholder: React.FC = () => {
    const handleBackToHome = () => {
        window.history.pushState({}, '', '/');
        window.location.reload(); // Simple reload to trigger route change
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-defacto-black via-defacto-green to-defacto-black flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white/5 backdrop-blur-sm rounded-3xl border border-defacto-cream/10 p-12 text-center">
                {/* Icon */}
                <div className="mb-8">
                    <div className="w-20 h-20 bg-defacto-gold/20 rounded-full flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-defacto-gold">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl font-serif font-bold text-defacto-cream mb-4">
                    Dashboard
                </h1>

                {/* Message */}
                <p className="text-lg text-defacto-cream/70 mb-8 leading-relaxed">
                    Phase 2 will implement CEO / Manager / Staff dashboards.
                </p>

                {/* Divider */}
                <div className="w-24 h-1 bg-defacto-gold/30 mx-auto mb-8"></div>

                {/* Back Button */}
                <button
                    onClick={handleBackToHome}
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-defacto-cream/30 text-defacto-cream px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/20 hover:border-defacto-gold transition-all duration-300 hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Homepage
                </button>

                {/* Footer Note */}
                <p className="mt-8 text-xs text-defacto-cream/40 uppercase tracking-widest">
                    Route: /dashboard
                </p>
            </div>
        </div>
    );
};

export default DashboardPlaceholder;
