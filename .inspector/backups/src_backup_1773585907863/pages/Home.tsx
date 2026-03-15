import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Clock, RefreshCcw, AlertTriangle, FileScan, Bot, BarChart3, Zap, BookOpen, GraduationCap, ShieldCheck, Building2 } from 'lucide-react';

const Home: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
            {/* 1 Navigation Bar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-black tracking-tight text-indigo-600">SEFAES</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Features</Link>
                            <Link to="/pricing" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Pricing</Link>
                            <Link to="/blog" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Blog</Link>
                            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Login</Link>
                        </div>

                        <div className="hidden md:flex items-center">
                            <Link to="/signup" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                                Get Started
                            </Link>
                        </div>

                        <div className="md:hidden flex items-center">
                            <button title="Toggle menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-indigo-600 transition-colors">
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-4">
                        <Link to="/features" className="block text-base font-semibold text-slate-700 hover:text-indigo-600">Features</Link>
                        <Link to="/pricing" className="block text-base font-semibold text-slate-700 hover:text-indigo-600">Pricing</Link>
                        <Link to="/blog" className="block text-base font-semibold text-slate-700 hover:text-indigo-600">Blog</Link>
                        <Link to="/login" className="block text-base font-semibold text-slate-700 hover:text-indigo-600">Login</Link>
                        <Link to="/signup" className="block w-full text-center px-6 py-3 text-base font-bold text-white bg-indigo-600 rounded-lg">Get Started</Link>
                    </div>
                )}
            </nav>

            {/* 2 Hero Section */}
            <section className="py-20 lg:py-32 bg-white text-center px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
                        AI Essay Grading for Schools and Institutions
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        SEFAES uses advanced OCR, deep AI semantic analysis, and structured marking schemes to grade essays objectively and instantly.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup" className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-all">
                            Start Free Trial
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 text-lg font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all">
                            Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3 Problem Section */}
            <section className="py-20 bg-slate-50 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">The Problem with Manual Assessment</h2>
                        <p className="mt-4 text-lg text-slate-600">Why schools are moving away from traditional grading.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Time Consuming</h3>
                            <p className="text-slate-600">Teachers spend 20–40 hours grading essays during exams.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                <RefreshCcw className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Inconsistent Grading</h3>
                            <p className="text-slate-600">Human grading varies due to fatigue and bias.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Delayed Results</h3>
                            <p className="text-slate-600">Students and parents wait days for feedback.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4 Solution Section */}
            <section className="py-20 bg-white px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">The SEFAES Solution</h2>
                        <p className="mt-4 text-lg text-slate-600">Everything needed for an automated grading cycle.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center sm:text-left">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                                <FileScan className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">OCR Script Reading</h3>
                            <p className="text-slate-600 text-sm">Read and transcribe handwritten student essays instantly.</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center sm:text-left">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                                <Bot className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Grading Engine</h3>
                            <p className="text-slate-600 text-sm">Evaluate subjective answers using advanced LLM reasoning.</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center sm:text-left">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Analytics</h3>
                            <p className="text-slate-600 text-sm">View pass rates and performance metrics in real-time.</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center sm:text-left">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Faster Academic Reporting</h3>
                            <p className="text-slate-600 text-sm">Export broad-sheets immediately when grading finishes.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5 Market Segments Section */}
            <section className="py-20 bg-slate-50 px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Tailored Workspaces</h2>
                        <p className="mt-4 text-lg text-slate-600">Choose the environment built for your organization.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link to="/portal/secondary" className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-500 hover:-translate-y-1 transition-all group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Secondary Schools</h3>
                            <p className="text-slate-500 text-sm">JSS to SSCE internal prep environment.</p>
                        </Link>
                        <Link to="/portal/university" className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-500 hover:-translate-y-1 transition-all group">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Universities</h3>
                            <p className="text-slate-500 text-sm">High-throughput semester examination grading pipeline.</p>
                        </Link>
                        <Link to="/portal/polytechnic" className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-500 hover:-translate-y-1 transition-all group">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Polytechnics</h3>
                            <p className="text-slate-500 text-sm">ND and HND assessment and analytical processing layer.</p>
                        </Link>
                        <Link to="/portal/corporate" className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-500 hover:-translate-y-1 transition-all group">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Corporate Training</h3>
                            <p className="text-slate-500 text-sm">Employee onboarding and evaluation sandbox.</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 6 Call-To-Action Section */}
            <section className="py-24 bg-indigo-600 px-6 text-center text-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Start Grading Essays in Minutes
                    </h2>
                    <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                        Schools can reduce their grading workload instantly by implementing our AI pipeline. Drop the pen and let the engine do the work.
                    </p>
                    <Link to="/signup" className="inline-flex justify-center items-center px-8 py-4 text-lg font-bold text-indigo-600 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors">
                        Get Started
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </div>
            </section>

            {/* 7 Footer */}
            <footer className="bg-slate-900 text-center py-12 px-6 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <p className="text-slate-300 text-sm font-medium mb-2">
                        Sentiment and Emotion Free Assessment and Evaluation System
                    </p>
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} SEFAES. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
