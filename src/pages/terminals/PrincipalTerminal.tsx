import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import {
    Users,
    GraduationCap,
    TrendingUp,
    Activity,
    ShieldCheck,
    PieChart as PieChartIcon,
    BarChart3,
    Calendar,
    Search,
    Filter
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { schoolService } from '../../services/schoolService';

const PrincipalTerminal: React.FC = () => {
    const { schoolId } = useStore();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        avgPerformance: 0,
        activeExams: 0
    });
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!schoolId) return;
        fetchPrincipalData();
    }, [schoolId]);

    const fetchPrincipalData = async () => {
        setLoading(true);
        try {
            const schoolStats = await schoolService.getSchoolStats(schoolId);
            setStats(schoolStats);

            // Mock performance comparison by class for demo
            setPerformanceData([
                { name: 'JSS1', score: 65 },
                { name: 'JSS2', score: 72 },
                { name: 'JSS3', score: 58 },
                { name: 'SS1', score: 81 },
                { name: 'SS2', score: 75 },
                { name: 'SS3', score: 88 }
            ]);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            {/* Terminal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-slate-900 rounded-lg shadow-lg">
                            <ShieldCheck className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Principal Terminal</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Institutional Oversight • State-Level Academic Intelligence</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 transition-all flex items-center space-x-2 text-sm font-bold shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Term 2, 2026</span>
                    </button>
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 text-sm">
                        Download State Report
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Enrollment', value: stats.totalStudents, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Faculty Size', value: stats.totalTeachers, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Academic Index', value: `${stats.avgPerformance}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Assessments', value: stats.activeExams, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live Sync</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900 mb-1">{stat.value}</p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Performance Correlation Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-slate-900 font-bold flex items-center uppercase tracking-tighter">
                                <BarChart3 className="w-5 h-5 mr-3 text-indigo-600" />
                                Class Performance Comparison
                            </h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Academic output by class level</p>
                        </div>
                        <div className="flex space-x-2">
                            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><Filter className="w-4 h-4 text-slate-400" /></button>
                            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><Search className="w-4 h-4 text-slate-400" /></button>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <defs>
                                    <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="score" radius={[8, 8, 8, 8]} barSize={40} fill="url(#principalGradient)">
                                    {performanceData.map((d, i) => (
                                        <Cell key={i} fill={d.score >= 75 ? '#10b981' : d.score >= 60 ? '#4f46e5' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                        <h3 className="text-xl font-black mb-6 tracking-tight relative z-10">System Health</h3>
                        <div className="space-y-6 relative z-10">
                            {[
                                { label: 'OCR Processing', val: '99.4%', status: 'optimal' },
                                { label: 'AI Grading Sync', val: '100%', status: 'active' },
                                { label: 'Storage Cluster', val: 'Optimal', status: 'optimal' }
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                                        <span>{s.label}</span>
                                        <span className="text-emerald-400">{s.val}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[95%]"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tighter">Teacher Compliance</h3>
                        <div className="space-y-5">
                            {[
                                { name: 'Sarah Johnson', sub: 'Mathematics', rate: '98%' },
                                { name: 'Bello Muhammed', sub: 'Physics', rate: '85%' },
                                { name: 'Chinwe Okoro', sub: 'English', rate: '92%' }
                            ].map((t, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs border border-slate-100">
                                            {t.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{t.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{t.sub}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-indigo-600">{t.rate}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrincipalTerminal;
