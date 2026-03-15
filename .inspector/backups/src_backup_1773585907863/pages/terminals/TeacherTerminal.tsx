import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import {
    PlusCircle,
    UploadCloud,
    BrainCircuit,
    FileCheck,
    MessageSquare,
    RotateCcw,
    Zap,
    Play,
    Loader2
} from 'lucide-react';

const TeacherTerminal: React.FC = () => {
    const { schoolId } = useStore();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!schoolId) return;
        fetchTeacherData();
    }, [schoolId]);

    const fetchTeacherData = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('exams')
                .select('*')
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false });
            setExams(data ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            {/* Teacher Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
                            <BrainCircuit className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Academic Operator</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Teacher Terminal • AI-Augmented Assessment Workflow</p>
                </div>
                <div className="flex space-x-4">
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 flex items-center space-x-2">
                        <PlusCircle className="w-5 h-5" />
                        <span>Create New Exam</span>
                    </button>
                </div>
            </div>

            {/* Workflow Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Active Exams Tracking */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <h3 className="text-lg font-black text-slate-900 flex items-center uppercase tracking-tighter">
                            <Zap className="w-5 h-5 mr-3 text-indigo-600" />
                            Active Assessment Pipeline
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Worker Sync</span>
                        </div>
                    </div>
                    <div className="flex-1 p-8">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            </div>
                        ) : exams.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <PlusCircle className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                <h4 className="text-xl font-bold text-slate-800">No Assessment Records</h4>
                                <p className="text-slate-500 mb-8">Start by creating your first exam rubric and uploading student scripts.</p>
                                <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">Begin Onboarding</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(exams ?? []).map((exam) => (
                                    <div key={exam.id} className="p-6 bg-white border border-slate-100 rounded-3xl group hover:shadow-lg hover:border-indigo-100 transition-all flex items-center justify-between">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                                <FileCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-lg tracking-tight uppercase">{exam.exam_title}</h4>
                                                <div className="flex items-center space-x-3 mt-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Mathematics</span>
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Approved</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Grading Progress</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-600 w-[65%]"></div>
                                                    </div>
                                                    <span className="text-xs font-black text-indigo-600">65%</span>
                                                </div>
                                            </div>
                                            <button className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all">
                                                <UploadCloud className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Alerts & Quick Actions */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                        <h3 className="text-xl font-black mb-6 tracking-tight flex items-center italic">
                            <BrainCircuit className="w-5 h-5 mr-3 text-indigo-400" />
                            AI Insight Stream
                        </h3>
                        <div className="space-y-6">
                            {[
                                { msg: 'JSS3 Physics scripts successfully extracted via OCR.', type: 'success' },
                                { msg: 'Anomalous grading detected in "Section B" of SS1 Math.', type: 'alert' },
                                { msg: 'Rubric optimization suggested for Biology essay.', type: 'suggest' }
                            ].map((s, i) => (
                                <div key={i} className="flex space-x-4 items-start p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${s.type === 'success' ? 'bg-emerald-400' : s.type === 'alert' ? 'bg-red-400' : 'bg-indigo-400'}`}></div>
                                    <p className="text-xs font-medium leading-relaxed text-slate-400">{s.msg}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tighter">Quick Operations</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Sync Queue', icon: RotateCcw },
                                { label: 'Start Batch', icon: Play },
                                { label: 'Review Log', icon: MessageSquare },
                                { label: 'Export PDF', icon: FileCheck }
                            ].map((op, i) => (
                                <button key={i} className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl hover:bg-indigo-600 hover:text-white transition-all group border border-slate-100">
                                    <op.icon className="w-6 h-6 mb-3 text-slate-400 group-hover:text-white group-hover:rotate-12 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{op.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherTerminal;
