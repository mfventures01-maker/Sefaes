import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

const PublicLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Features', path: '/features' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'Blog', path: '/blog' },
        { label: 'Contact', path: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-3 group">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
                                    <span className="font-extrabold text-lg">S</span>
                                </div>
                                <span className="text-2xl font-black text-slate-900 tracking-tight">SEFAES</span>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`text-sm font-semibold transition-colors ${location.pathname === item.path
                                            ? 'text-indigo-600'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors px-3 py-2"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-full shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95"
                            >
                                Start Free Trial
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="flex md:hidden items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                <div
                    className={`md:hidden absolute top-20 inset-x-0 bg-white border-b border-slate-200 shadow-xl transition-all duration-300 ease-in-out origin-top ${isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
                        }`}
                >
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-4 py-3 rounded-lg text-base font-bold ${location.pathname === item.path
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-slate-100 mt-4 flex flex-col space-y-3">
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-center px-4 py-3 text-base font-bold text-slate-700 bg-slate-50 rounded-xl hover:bg-slate-100"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-center px-4 py-3 text-base font-bold text-white bg-indigo-600 rounded-xl shadow-md"
                            >
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex flex-col relative w-full overflow-hidden">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-slate-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                    <span className="font-bold">S</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight">SEFAES</span>
                            </div>
                            <p className="text-slate-500 text-sm max-w-sm">
                                Sentiment and Emotion Free Assessment and Evaluation System. Bringing objective AI grading to education across Africa.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Product</h3>
                            <ul className="space-y-3">
                                <li><Link to="/features" className="text-slate-500 hover:text-indigo-600 text-sm font-medium">Features</Link></li>
                                <li><Link to="/pricing" className="text-slate-500 hover:text-indigo-600 text-sm font-medium">Pricing</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Company</h3>
                            <ul className="space-y-3">
                                <li><Link to="/blog" className="text-slate-500 hover:text-indigo-600 text-sm font-medium">Blog</Link></li>
                                <li><Link to="/contact" className="text-slate-500 hover:text-indigo-600 text-sm font-medium">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-slate-400 text-sm">© {new Date().getFullYear()} SEFAES. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
