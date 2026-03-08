import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCore, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-32 overflow-hidden bg-slate-900 border-b border-indigo-500/20">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20 filter grayscale blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>
                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-semibold tracking-wide border border-indigo-500/30 mb-6">
                        Pioneering African EdTech
                    </span>
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        AI Essay Grading for Schools and Institutions
                    </h1>
                    <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto font-medium">
                        Grade hundreds of scripts in minutes instead of days. Eliminate bias, reduce teacher workload, and deliver objective, WAEC-standard results instantly.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center mt-10 space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to="/register" className="inline-flex justify-center items-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                            Start Free Trial
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                        <Link to="/contact" className="inline-flex justify-center items-center px-8 py-4 text-lg font-bold text-slate-900 bg-white rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-all active:scale-95">
                            Book Demo
                        </Link>
                    </div>
                    <p className="mt-4 text-slate-400 text-sm">Or <Link to="/login" className="text-indigo-400 hover:underline">log in</Link> if you already have an account.</p>
                </div>
            </section>

            {/* Problem & Solution */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3">The Problem</h2>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
                                Teachers are drowning in paperwork.
                            </h3>
                            <p className="text-lg text-slate-600 mb-6">
                                Manual grading is subjective, exhausting, and steals valuable time away from actual teaching. An average teacher spends <strong>30% of their working hours</strong> just marking scripts, often resulting in inconsistent grading and delayed feedback.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1"><XCircleIcon className="w-5 h-5 text-red-500" /></div>
                                    <p className="ml-3 text-slate-700 font-medium">Inconsistent grading based on teacher fatigue.</p>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1"><XCircleIcon className="w-5 h-5 text-red-500" /></div>
                                    <p className="ml-3 text-slate-700 font-medium">Weeks of delay before students see their results.</p>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1"><XCircleIcon className="w-5 h-5 text-red-500" /></div>
                                    <p className="ml-3 text-slate-700 font-medium">Zero actionable data on class performance.</p>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200 relative shadow-xl">
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-50"></div>
                            <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-3">The SEFAES Solution</h2>
                            <h3 className="text-3xl font-extrabold text-slate-900 leading-tight mb-6">
                                Sentiment & Emotion Free Assessment.
                            </h3>
                            <p className="text-slate-600 mb-6 font-medium">
                                Our AI Vision engine reads student handwriting, evaluates it against your exact marking scheme, and outputs precise scores with constructive feedback in seconds.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                                    <p className="ml-3 text-slate-700 font-medium">100% Objective WAEC-standard marking.</p>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                                    <p className="ml-3 text-slate-700 font-medium">Mass batch processing (Grade 100 scripts / min).</p>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                                    <p className="ml-3 text-slate-700 font-medium">Automated CSV broadsheets and analytics.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Market Segments */}
            <section className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900">Built for every level of education</h2>
                        <p className="mt-4 text-lg text-slate-500">Choose your workspace to get started with an environment tailored to your institution's specific needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Link to="/portal" className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-500 hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Secondary Schools</h3>
                            <p className="text-slate-500 text-sm">Handle JSS to SS3 exams. Perfect for WAEC/NECO internal preparations.</p>
                        </Link>

                        <Link to="/portal" className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-500 hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Universities</h3>
                            <p className="text-slate-500 text-sm">Process thousands of semester examination scripts across massive faculties.</p>
                        </Link>

                        <Link to="/portal" className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-500 hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCore className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Polytechnics</h3>
                            <p className="text-slate-500 text-sm">Streamlined assessment and reporting for Nd1 through HND2 programs.</p>
                        </Link>

                        <Link to="/portal" className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-500 hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Building2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Corporate Training</h3>
                            <p className="text-slate-500 text-sm">Evaluate employee assessments securely with custom organizational rubrics.</p>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

const XCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default Home;
