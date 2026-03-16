import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import {
    BrainCircuit,
    UploadCloud,
    Play,
    CheckCircle,
    Activity,
    FileText,
    Loader2,
    Database,
    ChevronRight,
    TrendingUp,
    Users,
    Trophy
} from 'lucide-react';
import { performOCR } from '../services/geminiService';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { gradingService } from '../services/gradingService';

const DemoDashboard: React.FC = () => {
    const { schoolId } = useStore();

    // Panel 1: Exam Data
    const [examData, setExamData] = useState({
        exam_title: 'Biology Midterm Assessment',
        subject_id: '',
        class_id: '',
        exam_date: new Date().toISOString().split('T')[0],
        maxScore: 10
    });
    const [subjects, setSubjects] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isExamCreating, setIsExamCreating] = useState(false);
    const [createdExamId, setCreatedExamId] = useState<string | null>(null);

    // Panel 2 & 3: Upload & OCR
    const [files, setFiles] = useState<File[]>([]);
    const [ocrResults, setOcrResults] = useState<{ student: string, text: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [currentStep, setCurrentStep] = useState<string>('');

    // Panel 4: Grading
    const [isGrading, setIsGrading] = useState(false);
    const [gradingProgress, setGradingProgress] = useState({ completed: 0, total: 3 });

    // Panel 5: Results
    const [results, setResults] = useState<any[]>([]);

    // Panel 6: Intelligence
    const [insights, setInsights] = useState<{ weak_topics: string[], remediation_advice: string } | null>(null);
    const [governorError, setGovernorError] = useState<{ message: string, retryAfter: number } | null>(null);

    // Load initial data
    useEffect(() => {
        if (!schoolId) return;
        const loadInitialData = async () => {
            const [subjRes, classRes] = await Promise.all([
                supabase.from('subjects').select('*'),
                supabase.from('classes').select('id, name, school_id').eq('school_id', schoolId)
            ]);

            if (subjRes.data) setSubjects(subjRes.data);
            if (classRes.data) {
                setClasses(classRes.data);
                const { data: studentData } = await supabase
                    .from('students')
                    .select('id, first_name, last_name, class_id')
                    .eq('class_id', classRes.data[0]?.id || '');
                if (studentData) setStudents(studentData);
            }
        };
        loadInitialData();
    }, [schoolId]);

    // Step 1: Create Exam
    const handleCreateExam = async () => {
        if (!schoolId) return;
        setIsExamCreating(true);
        try {
            const markingScheme = {
                rubric: [{ criterion: 'Content Accuracy', marks: 10 }],
                maxScore: 10
            };
            const data = await gradingService.createExam({
                exam_title: examData.exam_title,
                subject_id: examData.subject_id || (subjects[0]?.id),
                class_id: examData.class_id || (classes[0]?.id),
                exam_date: examData.exam_date,
                marking_scheme: markingScheme,
                school_id: schoolId
            });
            setCreatedExamId(data.id);
            alert("Exam Created Successfully!");
        } catch (err) {
            console.error(err);
        } finally {
            setIsExamCreating(false);
        }
    };

    // Step 2 & 3: Upload & OCR
    const toBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !createdExamId) return;
        setGovernorError(null);
        const uploadFiles: File[] = Array.from(e.target.files);
        setFiles(uploadFiles);
        setIsUploading(true);
        const results: { student: string, text: string }[] = [];

        try {
            for (let i = 0; i < uploadFiles.length; i++) {
                const student = students[i] || { first_name: 'Student', last_name: `${i + 1}`, id: 'mock-id' };
                const studentFullName = `${student.first_name} ${student.last_name}`;
                setCurrentStep(`Running OCR for ${studentFullName}...`);
                const base64 = await toBase64(uploadFiles[i]);

                const { data, error } = await supabase.functions.invoke('ocr-script', {
                    body: { imageBase64: base64 }
                });

                if (error) {
                    if (error.status === 429) {
                        setGovernorError({ message: "OCR Rate Limit Reached (20/min)", retryAfter: 1 });
                    }
                    throw error;
                }

                const text = data.text;
                results.push({ student: studentFullName, text });

                await gradingService.uploadAnswerScript({
                    student_id: student.id,
                    exam_id: createdExamId,
                    ocr_text: text
                });
            }
            setOcrResults(results);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsUploading(false);
            setCurrentStep('');
        }
    };

    // Step 4: Start AI Grading
    const handleStartGrading = async () => {
        if (!createdExamId) return;
        setGovernorError(null);
        setIsGrading(true);
        try {
            // Fetch pending scripts to know the total count
            const { data: scripts } = await supabase
                .from('answer_scripts')
                .select('id')
                .eq('exam_id', createdExamId)
                .eq('grading_status', 'pending');

            if (!scripts || scripts.length === 0) return;

            setGradingProgress({ completed: 0, total: scripts.length });

            // Invoke grading via service (which calls edge function)
            await gradingService.startAIGrading(createdExamId);

            let isDone = false;
            while (!isDone) {
                const resultsData = await gradingService.getGradingResults(createdExamId, scripts.map(s => s.id));

                if (resultsData) {
                    setResults(resultsData);
                    setGradingProgress({ completed: resultsData.length, total: scripts.length });
                    if (resultsData.length >= scripts.length) isDone = true;
                }
                if (!isDone) await new Promise(r => setTimeout(r, 2000));
            }

            // Fetch Intelligence Insights
            const { data: insightData } = await supabase
                .from('class_insights')
                .select('*')
                .eq('exam_id', createdExamId)
                .single();

            if (insightData) setInsights(insightData);

        } catch (err) {
            console.error(err);
        } finally {
            setIsGrading(false);
        }
    };

    // Analytics Data Transformation
    const analyticsData = (results ?? []).map(r => ({
        name: r.answer_scripts?.students ? `${r.answer_scripts.students.first_name} ${r.answer_scripts.students.last_name}` : 'Student',
        score: parseFloat(r.score)
    }));

    const classAverage = insights?.class_average || (analyticsData.length > 0
        ? (analyticsData.reduce((acc, curr) => acc + curr.score, 0) / analyticsData.length).toFixed(1)
        : 0);

    const topStudent = analyticsData.length > 0
        ? analyticsData.sort((a, b) => b.score - a.score)[0].name
        : 'N/A';

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <BrainCircuit className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">SEFAES Intelligence Demo</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Single-Screen Full Pipeline Visibility • 3-Minute WOW Window</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-${i + 2}00 flex items-center justify-center`}>
                                <Users className="w-5 h-5 text-slate-400" />
                            </div>
                        ))}
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-indigo-600 uppercase">Live Pipeline</p>
                        <p className="text-sm font-bold text-slate-900">3 Scripts Detected</p>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Panel 1: Exam Creator */}
                <div className="lg:col-span-4 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
                    <div className="bg-slate-900 p-6 flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-indigo-400" />
                            1. EXAM CREATOR
                        </h3>
                        {createdExamId && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Exam Title</label>
                            <input
                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                                value={examData.exam_title}
                                onChange={e => setExamData({ ...examData, exam_title: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Class</label>
                                <select className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                                    onChange={e => setExamData({ ...examData, class_id: e.target.value })}>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Subject</label>
                                <select className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                                    onChange={e => setExamData({ ...examData, subject_id: e.target.value })}>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateExam}
                            disabled={isExamCreating || !!createdExamId}
                            className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center space-x-2 ${createdExamId
                                ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'
                                }`}>
                            {isExamCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                            <span>{createdExamId ? 'EXAM READY' : 'CREATE EXAM'}</span>
                        </button>
                    </div>
                </div>

                {/* Panel 2: Script Upload */}
                <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
                    <div className="bg-white p-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-slate-900 font-bold flex items-center uppercase tracking-tighter">
                            <UploadCloud className="w-5 h-5 mr-2 text-indigo-600" />
                            2. SCRIPT UPLOAD (AI DIGITIZATION)
                        </h3>
                        <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">MULTIMODAL OCR</span>
                    </div>
                    <div className="p-8 flex items-center justify-center flex-1">
                        {!createdExamId ? (
                            <div className="text-center opacity-40">
                                <Database className="w-12 h-12 mx-auto mb-2" />
                                <p className="font-bold">Complete Step 1 to unlock upload</p>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="relative group w-full max-w-md">
                                <input
                                    type="file" multiple accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleFileUpload}
                                />
                                <div className="border-4 border-dashed border-slate-100 rounded-3xl p-10 text-center group-hover:border-indigo-200 transition-all bg-slate-50/50">
                                    <UploadCloud className="w-12 h-12 text-slate-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="text-xl font-bold text-slate-800">Drop 3 Student Scripts</h4>
                                    <p className="text-slate-400 text-sm mt-2">PNG, JPEG captured from class</p>
                                </div>
                            </div>
                        ) : isUploading ? (
                            <div className="text-center space-y-4">
                                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto" />
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{currentStep}</p>
                                <div className="w-64 h-2 bg-slate-100 rounded-full mx-auto overflow-hidden">
                                    <div className="h-full bg-indigo-600 animate-[shimmer_1.5s_infinite]"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex space-x-6">
                                {files.map((f, i) => (
                                    <div key={i} className="flex flex-col items-center animate-in zoom-in duration-500">
                                        <div className="w-32 h-40 bg-slate-100 rounded-xl border-4 border-white shadow-md overflow-hidden relative">
                                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                                <CheckCircle className="w-10 h-10 text-emerald-600" />
                                            </div>
                                            <img src={URL.createObjectURL(f)} className="w-full h-full object-cover grayscale opacity-50" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">{students[i] ? `${students[i].first_name} ${students[i].last_name}` : `Page ${i + 1}`}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel 3: OCR Viewer */}
                <div className="lg:col-span-12 bg-slate-900 rounded-3xl shadow-2xl p-8 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <Activity className="w-6 h-6 text-emerald-400" />
                            <h3 className="text-white font-bold tracking-widest uppercase">3. LIVE OCR EXTRACTION PREVIEW</h3>
                        </div>
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {ocrResults.length === 0 ? (
                            <div className="col-span-3 py-10 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                                <p className="text-slate-600 font-bold uppercase tracking-widest">Waiting for script digitization...</p>
                            </div>
                        ) : ocrResults.map((res, i) => (
                            <div key={i} className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded">MATCHED</span>
                                    <span className="text-xs font-bold text-slate-400">{res.student}</span>
                                </div>
                                <div className="h-32 overflow-y-auto text-sm text-slate-300 font-mono leading-relaxed p-2 custom-scrollbar">
                                    {res.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel 4 & 5: Queue & Results */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Panel 4: Grading Queue */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                        <h3 className="text-slate-900 font-bold flex items-center uppercase mb-6 tracking-tighter">
                            <Play className="w-5 h-5 mr-2 text-indigo-600" />
                            4. START AI GRADING
                        </h3>
                        {ocrResults.length === 0 ? (
                            <div className="text-center py-6 opacity-30">
                                <BrainCircuit className="w-12 h-12 mx-auto mb-2" />
                                <p className="font-bold">Scripts Required</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <button
                                    onClick={handleStartGrading}
                                    disabled={isGrading || results.length > 0}
                                    className={`w-full py-5 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center space-x-3 group ${results.length > 0
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-200'
                                        }`}>
                                    {isGrading ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                                    <span className="text-lg">{results.length > 0 ? 'GRADING COMPLETE' : 'START AI GRADING'}</span>
                                </button>

                                {isGrading && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                                            <span>Processing Pipeline</span>
                                            <span>{gradingProgress.completed} / {gradingProgress.total}</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 transition-all duration-1000"
                                                style={{ width: `${(gradingProgress.completed / gradingProgress.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Avg</span>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">{classAverage}</span>
                                <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
                            </div>
                        </div>
                        <div className="bg-indigo-600 rounded-3xl p-6 shadow-lg shadow-indigo-100 flex flex-col justify-between text-white">
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Top Student</span>
                            <div className="flex items-end justify-between">
                                <span className="text-xl font-black tracking-tight truncate mr-2">{topStudent}</span>
                                <Trophy className="w-5 h-5 text-yellow-300 mb-0.5 flex-shrink-0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 5: Results Table */}
                <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-slate-900 font-bold flex items-center uppercase tracking-tighter">
                            <Database className="w-5 h-5 mr-2 text-indigo-600" />
                            5. AI GRADING RESULTS
                        </h3>
                        <div className="flex space-x-2">
                            <div className="bg-slate-100 p-2 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
                                <Activity className="w-4 h-4 text-slate-500" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {results.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-10 text-center opacity-30">
                                <Loader2 className="w-10 h-10 mb-4" />
                                <p className="font-bold uppercase tracking-widest">Waiting for AI Evaluation...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-black text-slate-400">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4 text-center">Score</th>
                                        <th className="px-6 py-4">AI Feedback</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {results.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors animate-in slide-in-from-left duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                            <td className="px-6 py-5 font-bold text-slate-700">{r.answer_scripts?.students ? `${r.answer_scripts.students.first_name} ${r.answer_scripts.students.last_name}` : 'Unknown'}</td>
                                            <td className="px-6 py-5 text-center font-black">
                                                <span className={`px-3 py-1 rounded-full ${r.score >= 70 ? 'bg-emerald-50 text-emerald-600' :
                                                    r.score >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {r.score}/10
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-slate-500 leading-snug">
                                                {r.ai_feedback}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* AI Usage Governor Banner */}
                {governorError && (
                    <div className="lg:col-span-12 bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex items-center justify-between animate-in slide-in-from-top duration-500">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-amber-100 rounded-2xl">
                                <Activity className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-amber-900 uppercase tracking-tight">{governorError.message}</h4>
                                <p className="text-amber-700 text-sm font-medium">Compliance limit reached for this window. System protected from cost spikes.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">Retry After</span>
                            <span className="text-xl font-black text-amber-900">{governorError.retryAfter} MIN</span>
                        </div>
                    </div>
                )}

                {/* Panel 6: Class Analytics & Intelligence */}
                <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Performance Chart */}
                    <div className="lg:col-span-12 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-slate-900 font-bold flex items-center uppercase tracking-tighter">
                                    <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                                    6. CLASS INTELLIGENCE ANALYTICS
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Performance Distribution</p>
                            </div>
                        </div>

                        <div className="h-80 w-full">
                            {analyticsData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            domain={[0, 10]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc', radius: 10 }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        />
                                        <Bar dataKey="score" radius={[10, 10, 10, 10]} barSize={50} fill="url(#barGradient)">
                                            {analyticsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.score >= 7 ? '#4f46e5' : entry.score >= 5 ? '#f59e0b' : '#ef4444'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-[0.2em]">
                                    Complete grading to visualize analytics
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Intelligence Report (Logic-Based) */}
                    {insights && (
                        <div className="lg:col-span-12 bg-slate-900 rounded-3xl p-10 overflow-hidden relative group animate-in slide-in-from-bottom duration-1000">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BrainCircuit className="w-40 h-40 text-white" />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-10">
                                <div className="md:w-1/3">
                                    <span className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Intelligence Report</span>
                                    <h3 className="text-2xl font-black text-white tracking-tight mb-6">WEAK CONCEPTS DETECTED</h3>
                                    <div className="space-y-4">
                                        {insights.weak_topics.map((topic, i) => (
                                            <div key={i} className="flex items-center space-x-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                <span className="text-slate-300 font-bold">{topic}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:w-2/3">
                                    <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Teacher Guidance</span>
                                    <h3 className="text-2xl font-black text-white tracking-tight mb-6">RECOMMENDED REMEDIATION</h3>
                                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
                                        <p className="text-lg text-slate-300 font-medium leading-relaxed italic">
                                            "{insights.remediation_advice}"
                                        </p>
                                    </div>
                                    <div className="mt-8 flex items-center space-x-4">
                                        <div className="bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                                            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Actionable Insights Generated</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Floating Action Button (Alternative Demo Reset) */}
            <div className="fixed bottom-10 right-10 flex flex-col space-y-4">
                <button
                    onClick={() => window.location.reload()}
                    className="w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:scale-110 transition-all border border-slate-100"
                    title="Reset Demo"
                >
                    <Activity className="w-6 h-6" />
                </button>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default DemoDashboard;
