import React, { useState, useRef } from 'react';
import HomeHero from './HomeHero';
import ExperienceHighlights from './ExperienceHighlights';
import BarTraySection from './BarTraySection';
import FoodMenuSection from './FoodMenuSection';
import StaffSection from './StaffSection';
import StaffPortalSection from './StaffPortalSection';
import HomeFooter from './HomeFooter';
import ReserveTableModal from './ReserveTableModal';

const Homepage: React.FC = () => {
    const [isReservationOpen, setIsReservationOpen] = useState(false);

    // Refs for scroll targets
    const barTrayRef = useRef<HTMLDivElement>(null);
    const foodMenuRef = useRef<HTMLDivElement>(null);
    const staffRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollToChapman = () => {
        // Scroll to bar tray section (Chapman is in the bar section)
        scrollToSection(barTrayRef);
        // Optional: Could add a filter state to auto-filter to Chapman after scroll
    };

    const handleNavigateToDashboard = () => {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <div className="min-h-screen bg-defacto-cream">
            {/* Hero Section */}
            <HomeHero
                onScrollToBar={() => scrollToSection(barTrayRef)}
                onScrollToFood={() => scrollToSection(foodMenuRef)}
                onOpenReservation={() => setIsReservationOpen(true)}
                onScrollToChapman={scrollToChapman}
            />

            {/* Experience Highlights */}
            <ExperienceHighlights
                onScrollToBar={() => scrollToSection(barTrayRef)}
                onScrollToFood={() => scrollToSection(foodMenuRef)}
                onOpenReservation={() => setIsReservationOpen(true)}
            />

            {/* Bar Tray Section */}
            <div ref={barTrayRef}>
                <BarTraySection />
            </div>

            {/* Food Menu Section */}
            <div ref={foodMenuRef}>
                <FoodMenuSection />
            </div>

            {/* Staff Section */}
            <div ref={staffRef}>
                <StaffSection />
            </div>

            {/* Staff Portal Section (just above footer) */}
            <StaffPortalSection onNavigateToDashboard={handleNavigateToDashboard} />

            {/* Footer */}
            <HomeFooter />

            {/* Reserve Table Modal */}
            <ReserveTableModal
                isOpen={isReservationOpen}
                onClose={() => setIsReservationOpen(false)}
            />
        </div>
    );
};

export default Homepage;

