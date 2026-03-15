import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, Loader2 } from 'lucide-react';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call to send message
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="bg-white py-24 sm:py-32 flex-1">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center mb-16">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600 tracking-widest uppercase">Contact Us</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Let's talk about grading automation
                    </p>
                    <p className="mt-6 text-lg leading-8 text-slate-600">
                        Interested in deploying SEFAES at your institution? Reach out to our team and we'll help you set up a custom pilot program.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mx-auto max-w-5xl">
                    <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-2xl font-bold text-slate-900 mb-8">Send us a message</h3>

                        {success ? (
                            <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-200 text-center">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h4 className="text-lg font-bold mb-2">Message Sent!</h4>
                                <p className="text-sm">Thank you for reaching out. Our enterprise team will get back to you within 24 hours.</p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="mt-6 text-emerald-600 font-semibold hover:underline text-sm"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold leading-6 text-slate-900">Full Name</label>
                                    <div className="mt-2.5">
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="block w-full rounded-xl border-0 px-3.5 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold leading-6 text-slate-900">Institutional Email</label>
                                    <div className="mt-2.5">
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="block w-full rounded-xl border-0 px-3.5 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-semibold leading-6 text-slate-900">Message</label>
                                    <div className="mt-2.5">
                                        <textarea
                                            name="message"
                                            id="message"
                                            rows={4}
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            className="block w-full rounded-xl border-0 px-3.5 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center rounded-xl bg-indigo-600 px-3.5 py-3.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-95 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Send Message
                                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="flex flex-col justify-center space-y-12 lg:pl-8">
                        <div className="flex gap-x-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <MessageSquare className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold leading-7 text-slate-900">Sales & Demos</h3>
                                <p className="mt-2 leading-7 text-slate-600">Looking to deploy SEFAES at scale? Book a live demonstration of our batch processor.</p>
                                <p className="mt-3 font-semibold text-indigo-600">sales@sefaes.com</p>
                            </div>
                        </div>

                        <div className="flex gap-x-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Mail className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold leading-7 text-slate-900">Technical Support</h3>
                                <p className="mt-2 leading-7 text-slate-600">Existing institution running into issues? Our specialized engineers are available 24/7.</p>
                                <p className="mt-3 font-semibold text-indigo-600">support@sefaes.com</p>
                            </div>
                        </div>

                        <div className="flex gap-x-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <MapPin className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold leading-7 text-slate-900">Headquarters</h3>
                                <p className="mt-2 leading-7 text-slate-600">14 Tech Avenue, Victoria Island<br />Lagos, Nigeria</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export default Contact;
