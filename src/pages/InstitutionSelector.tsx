import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, ShieldCheck, Building2 } from 'lucide-react';
import { useInstitutionStore } from '../store/useInstitutionStore';

const InstitutionSelector: React.FC = () => {
    const { setInstitutionType } = useInstitutionStore();
    const navigate = useNavigate();

    const handleSelect = (type: 'secondary_school' | 'university' | 'corporate') => {
        setInstitutionType(type);
        navigate(`/portal/${type}/dashboard`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-6 transform hover:rotate-6 transition-transform">
                    <span className="font-extrabold text-3xl">S</span>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-slate-900">
                    Select your workspace
                </h2>
                <p className="mt-2 text-center text-lg text-slate-600">
                    Choose the institutional profile to load your dedicated operational environment.
                </p>
            </div>

            <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">

                    <button onClick={() => handleSelect('secondary_school')} className="text-left group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform mb-4">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Secondary Schools</h3>
                                <p className="text-slate-500 text-sm">JSS to SS3, WAEC & NECO internal preparation environment.</p>
                            </div>
                        </div>
                    </button>

                    <button onClick={() => handleSelect('university')} className="text-left group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-500 hover:-translate-y-1 transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform mb-4">
                                <GraduationCap className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Universities</h3>
                                <p className="text-slate-500 text-sm">High-throughput semester examination grading pipeline.</p>
                            </div>
                        </div>
                    </button>

                    <button onClick={() => handleSelect('corporate')} className="text-left group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform mb-4">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Corporate Training</h3>
                                <p className="text-slate-500 text-sm">Employee onboarding and evaluation sandbox.</p>
                            </div>
                        </div>
                    </button>

                </div>

            </div>

            <div className="mt-12 text-center">
                <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                    ← Return to Home
                </Link>
            </div>
        </div>
    );
};

export default InstitutionSelector;
