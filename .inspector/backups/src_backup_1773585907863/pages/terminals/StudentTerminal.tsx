import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import {
    Calendar,
    FileText,
    Trophy,
    ArrowRight,
    BookOpen,
    Star,
    Loader2,
    ChevronRight,
    GraduationCap,
    Zap,
    MessageSquare,
    Clock
} from 'lucide-react';

const StudentTerminal: React.FC = () => {
    const { schoolId } = useStore();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!schoolId) return;
        fetchStudentData();
    }, [schoolId]);

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            // Mocking student results for demo
            setResults([
                { id: '1', title: 'Mathematics Midterm', score: '82/100', status: 'Graded', date: '2026-03-10', feedback: 'Excellent grasp of algebraic expressions.' },
                { id: '2', title: 'Basic Science Quiz', score: '45/100', status: 'Graded', date: '2026-03-12', feedback: 'Need to review cellular respiration.' },
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            {/* Student Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 rotate-3">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Academic Visibility</h1>
                        <p className="text-slate-500 font-medium">Student Terminal • Lagos City Academy</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">75</div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Rank</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Academic Record */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 flex items-center uppercase tracking-tighter">
                            <FileText className="w-5 h-5 mr-3 text-blue-600" />
                            Recent Graded Scripts
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 30 Days</span>
                    </div>
                    <div className="p-8 space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-400 font-bold uppercase tracking-widest">No results synchronized yet.</p>
                            </div>
                        ) : (
                            results.map((r, i) => (
                                <div key={r.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-500 transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                                <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 tracking-tight uppercase">{r.title}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{r.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">{r.score}</p>
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">SYCHRONIZED</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200/50">
                                        <div className="flex items-start space-x-3 text-slate-500">
                                            <MessageSquare className="w-4 h-4 mt-1 text-slate-400" />
                                            <p className="text-sm font-medium leading-relaxed italic">"{r.feedback}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Schedules & Performance */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                            <Trophy className="w-32 h-32" />
                        </div>
                        <h3 className="text-xl font-black mb-6 tracking-tight relative z-10 uppercase">Achievements</h3>
                        <div className="space-y-6 relative z-10">
                            {[
                                { label: 'Top Performer', sub: 'Mathematics Term 1', icon: Star, color: 'text-amber-400' },
                                { label: 'Active Learner', sub: 'Subject participation at 95%', icon: Zap, color: 'text-emerald-400' }
                            ].map((a, i) => (
                                <div key={i} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <a.icon className={`w-6 h-6 ${a.color}`} />
                                    <div>
                                        <p className="text-sm font-black">{a.label}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{a.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tighter">Upcoming Assessments</h3>
                        <div className="space-y-4">
                            {[
                                { sub: 'Civic Education', time: 'Monday, 9:00 AM' },
                                { sub: 'Basic Science', time: 'Wednesday, 11:30 AM' }
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-l-4 border-blue-600">
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{s.sub}</p>
                                        <div className="flex items-center space-x-2 mt-0.5">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.time}</span>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default StudentTerminal;
