import React, { useState } from 'react';

interface ReserveTableModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReserveTableModal: React.FC<ReserveTableModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        time: '',
        guests: '2',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Format WhatsApp message
        const message = `*Table Reservation Request*\n\nName: ${formData.name}\nPhone: ${formData.phone}\nDate: ${formData.date}\nTime: ${formData.time}\nGuests: ${formData.guests}\n${formData.notes ? `Notes: ${formData.notes}` : ''}`;

        // WhatsApp number (update with actual De Facto number)
        const whatsappNumber = '2348000000000';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');

        // Reset form and close modal
        setFormData({
            name: '',
            phone: '',
            date: '',
            time: '',
            guests: '2',
            notes: ''
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-gradient-to-br from-defacto-cream to-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-defacto-green text-defacto-cream px-8 py-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-defacto-gold/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-serif font-bold mb-2">Reserve Your Table</h2>
                        <p className="text-defacto-cream/80 text-sm">Secure your spot at Asaba's finest lounge</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-defacto-cream/60 hover:text-defacto-cream transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-defacto-green mb-2 uppercase tracking-wider">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-defacto-green/20 focus:border-defacto-gold focus:outline-none text-defacto-green transition-colors"
                            placeholder="Your name"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-bold text-defacto-green mb-2 uppercase tracking-wider">
                            Phone (WhatsApp) *
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-defacto-green/20 focus:border-defacto-gold focus:outline-none text-defacto-green transition-colors"
                            placeholder="+234 800 000 0000"
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-defacto-green mb-2 uppercase tracking-wider">
                                Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-defacto-green/20 focus:border-defacto-gold focus:outline-none text-defacto-green transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-defacto-green mb-2 uppercase tracking-wider">
                                Time *
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-defacto-green/20 focus:border-defacto-gold focus:outline-none text-defacto-green transition-colors"
                            />
                        </div>
                    </div>

                    {/* Guests */}
                    <div>
                        <label className="block text-sm font-bold text-defacto-green mb-2 uppercase tracking-wider">
                            Number of Guests *
                        </label>
                        <select
                            required
                            value={formData.guests}
                            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-defacto-green/20 focus:border-defacto-gold focus:outline-none text-defacto-green transition-colors"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                            ))}
                            <option value="10+">10+ Guests</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-defacto-green mb-2 uppercase tracking-wider">
                            Special Requests (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-defacto-green/20 focus:border-defacto-gold focus:outline-none text-defacto-green transition-colors resize-none"
                            placeholder="Dietary restrictions, seating preferences, etc."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-defacto-gold text-defacto-black py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-2xl hover:shadow-defacto-gold/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                        Send via WhatsApp
                    </button>

                    <p className="text-xs text-defacto-green/60 text-center">
                        Your reservation request will be sent via WhatsApp for confirmation
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ReserveTableModal;
