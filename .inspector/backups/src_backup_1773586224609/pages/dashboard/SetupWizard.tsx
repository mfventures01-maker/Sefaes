import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, ArrowRight } from 'lucide-react';
import { useInstitutionStore } from '../../store/useInstitutionStore';

const SetupWizard: React.FC = () => {
    const { institutionType } = useInstitutionStore();

    // Normalize path based on institution type
    const portalPath = `/portal/${institutionType || 'secondary'}`;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-indigo-600 p-12 text-center text-white">
                        <h1 className="text-4xl font-extrabold mb-4">Welcome to SEFAES</h1>
                        <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                            Your institution profile is ready. Let's finish the setup so you can start grading essays with AI.
                        </p>
                    </div>

                    <div className="p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Link to={`${portalPath}/classes`} className="group p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-white hover:shadow-lg transition-all">
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Create Classes</h3>
                                <p className="text-slate-500 mb-4">Define your academic structure and class levels.</p>
                                <div className="flex items-center text-indigo-600 font-bold group-hover:translate-x-2 transition-transform">
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </Link>

                            <Link to={`${portalPath}/subjects`} className="group p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-white hover:shadow-lg transition-all">
                                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Create Subjects</h3>
                                <p className="text-slate-500 mb-4">Add the courses and subjects you will be grading.</p>
                                <div className="flex items-center text-indigo-600 font-bold group-hover:translate-x-2 transition-transform">
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </Link>

                            <Link to={`${portalPath}/students`} className="group p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-white hover:shadow-lg transition-all">
                                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Users className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Add Students</h3>
                                <p className="text-slate-500 mb-4">Import or manually upload your student enrollment data.</p>
                                <div className="flex items-center text-indigo-600 font-bold group-hover:translate-x-2 transition-transform">
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </Link>

                            <Link to={`${portalPath}/dashboard`} className="group p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-white hover:shadow-lg transition-all flex flex-col justify-center items-center text-center">
                                <div className="text-slate-900 font-bold text-xl mb-2">Skip for now</div>
                                <p className="text-slate-500">Go directly to your operational dashboard.</p>
                                <div className="mt-4 flex items-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                    Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupWizard;
