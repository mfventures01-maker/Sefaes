import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import {
    Clock,
    FileCheck,
    AlertTriangle,
    ChevronRight,
    LayoutDashboard,
    Search,
    BookOpen,
    Users
} from 'lucide-react';

const VicePrincipalTerminal: React.FC = () => {
    const { schoolId } = useStore();
    const [pendingExams, setPendingExams] = useState<any[]>([]);
    const [gradingAnomalies, setGradingAnomalies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!schoolId) return;
        fetchVpData();
    }, [schoolId]);

    const fetchVpData = async () => {
        setLoading(true);
        try {
            // Mocking academic data for demo
            setPendingExams([
                { id: '1', title: 'Mathematics Midterm', teacher: 'Sarah Johnson', date: '2026-03-20', status: 'awaiting_approval' },
                { id: '2', title: 'English Essay', teacher: 'Chinwe Okoro', date: '2026-03-22', status: 'awaiting_approval' },
            ]);

            setGradingAnomalies([
                { id: '101', student: 'Abubakar Musa', score: '98/100', reason: 'Abnormally high variance', teacher: 'Sarah Johnson' },
                { id: '102', student: 'Blessing Udoh', score: '12/100', reason: 'High confidence, low accuracy', teacher: 'Bello Muhammed' }
            ]);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            {/* VP Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Academic Supervision</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Vice Principal Terminal • Quality Control & Approval Center</p>
                </div>
                <div className="flex space-x-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input className="bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-xl text-sm font-bold w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Search exams or scripts..." />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Pending Approvals */}
                <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 flex items-center uppercase tracking-tighter">
                            <Clock className="w-5 h-5 mr-3 text-indigo-600" />
                            Pending Exam Approvals
                        </h3>
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full">{pendingExams.length} ACTION REQUIRED</span>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(pendingExams ?? []).map((exam) => (
                                <div key={exam.id} className="p-6 bg-white border border-slate-100 rounded-3xl hover:border-indigo-500 transition-colors group relative shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-slate-50 rounded-xl">
                                                <BookOpen className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800">{exam.title}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase">{exam.teacher}</p>
                                            </div>
                                        </div>
                                        <FileCheck className="w-6 h-6 text-slate-200 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.date}</span>
                                        <button className="text-indigo-600 text-xs font-black flex items-center hover:translate-x-1 transition-transform uppercase">
                                            Review Rubric <ChevronRight className="ml-1 w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Anomalies Tracker */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 flex items-center uppercase tracking-tighter">
                            <AlertTriangle className="w-5 h-5 mr-3 text-red-500" />
                            Grading Anomaly Detector
                        </h3>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Audit Logs</span>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Student / Teacher</th>
                                    <th className="px-8 py-5">Result</th>
                                    <th className="px-8 py-5">Detection Signal</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(gradingAnomalies ?? []).map((a) => (
                                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 text-xs uppercase">{a.student[0]}</div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm">{a.student}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{a.teacher}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-slate-900">{a.score}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase">{a.reason}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-slate-800 transition-all uppercase">Verify</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Subject Monitoring */}
                <div className="lg:col-span-4 bg-slate-900 rounded-[2.5rem] p-8 text-white">
                    <h3 className="text-xl font-black mb-6 tracking-tight flex items-center">
                        <Users className="w-5 h-5 mr-3 text-emerald-400" />
                        Engagement
                    </h3>
                    <div className="space-y-8">
                        {[
                            { name: 'Mathematics', val: 92, status: 'Normal' },
                            { name: 'English', val: 78, status: 'Below Target' },
                            { name: 'Economics', val: 95, status: 'High' }
                        ].map((s, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <p className="text-sm font-bold">{s.name}</p>
                                    <span className="text-[10px] font-black text-slate-500 uppercase">{s.val}% participation</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${s.val >= 90 ? 'bg-emerald-500' : s.val >= 80 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                                        style={{ width: `${s.val}%` }}
                                    ></div>
                                </div>
                                <p className={`text-[10px] font-black uppercase text-right ${s.status === 'Normal' ? 'text-slate-500' : s.status === 'High' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {s.status}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VicePrincipalTerminal;
