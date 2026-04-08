import React, { useState } from 'react';
import { staffMembers, CONCIERGE_CONTACT } from '../../data/staff';

const StaffSection: React.FC = () => {
    const handleContactConcierge = () => {
        const message = encodeURIComponent(CONCIERGE_CONTACT.defaultMessage);
        const whatsappUrl = `https://wa.me/${CONCIERGE_CONTACT.whatsappNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <section id="staff" className="py-20 px-6 bg-defacto-cream">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-5xl md:text-6xl font-serif font-bold text-defacto-green mb-4">
                        Meet Our Team
                    </h2>
                    <p className="text-lg text-defacto-green/70 max-w-2xl mx-auto mb-8">
                        The people behind the experience. Dedicated professionals who make every visit exceptional.
                    </p>

                    {/* Concierge CTA */}
                    <button
                        onClick={handleContactConcierge}
                        className="inline-flex items-center gap-2 bg-defacto-green text-defacto-cream px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-2xl hover:bg-defacto-gold hover:text-defacto-black transition-all duration-300 hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                        Contact Concierge
                    </button>
                </div>

                {/* Staff Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {staffMembers.map(member => (
                        <StaffCard key={member.id} member={member} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Individual Staff Card Component
interface StaffCardProps {
    member: {
        id: string;
        name: string;
        role: string;
        trait: string;
        image: string;
    };
}

const StaffCard: React.FC<StaffCardProps> = ({ member }) => {
    const [imageError, setImageError] = useState(false);

    // Generate initials for fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate a consistent color based on name
    const getAvatarColor = (name: string) => {
        const colors = [
            'from-emerald-600 to-teal-700',
            'from-blue-600 to-indigo-700',
            'from-purple-600 to-pink-700',
            'from-orange-600 to-red-700',
            'from-amber-600 to-yellow-700',
            'from-cyan-600 to-blue-700'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-defacto-green/10 shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-300">
            {/* Image or Fallback */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-br from-defacto-green/5 to-defacto-gold/5">
                {!imageError ? (
                    <img
                        src={member.image}
                        alt={member.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(member.name)} flex items-center justify-center text-white`}>
                        <span className="text-6xl font-bold">{getInitials(member.name)}</span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-xl font-serif font-bold text-defacto-green mb-1 leading-tight">
                    {member.name}
                </h3>
                <p className="text-sm font-bold text-defacto-gold uppercase tracking-wider mb-3">
                    {member.role}
                </p>
                <p className="text-sm text-defacto-green/70 italic">
                    "{member.trait}"
                </p>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-defacto-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
    );
};

export default StaffSection;
