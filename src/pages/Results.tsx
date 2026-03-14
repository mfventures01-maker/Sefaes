import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { DownloadCloud, Filter, Loader2, FileSearch, Search } from 'lucide-react';

const Results: React.FC = () => {
    const { schoolId } = useStore();
    const [results, setResults] = useState<any[]>([]);
    const [classes, setClasses] = useState<{ id: string; class_name: string }[]>([]);
    const [exams, setExams] = useState<{ id: string; exam_title: string; class_id: string }[]>([]);

    const [loading, setLoading] = useState(true);

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (schoolId) {
            fetchFilters();
            fetchResults();
        } else {
            setLoading(false);
        }
    }, [schoolId]);

    const fetchFilters = async () => {
        if (!schoolId) return;
        try {
            const [classRes, examRes] = await Promise.all([
                supabase.from('classes').select('id, class_name').eq('school_id', schoolId).order('created_at'),
                supabase.from('exams').select('id, exam_title, class_id').order('created_at')
            ]);

            if (classRes.data) setClasses(classRes.data);
            if (examRes.data) setExams(examRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchResults = async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            // Need a flat join for easy display:
            // grading_results -> answer_scripts -> students & exams
            const { data, error: supabaseError } = await supabase
                .from('grading_results')
                .select(`
          id,
          score,
          ai_feedback,
          answer_scripts (
            id,
            students (
              id,
              student_name,
              class_id
            ),
            exams (
              id,
              exam_title,
              class_id
            )
          )
        `);

            if (supabaseError) throw supabaseError;

            // PHASE 1 & 2: Normalize data
            const safeData = data ?? [];

            const formatted = safeData.map((d: any) => ({
                id: d.id,
                studentName: d.answer_scripts?.students?.student_name || 'Unknown',
                classId: d.answer_scripts?.students?.class_id || '',
                examId: d.answer_scripts?.exams?.id || '',
                examTitle: d.answer_scripts?.exams?.exam_title || 'Unknown Exam',
                score: d.score,
                feedback: d.ai_feedback,
            }));

            // PHASE 3: Guarded state update
            setResults(formatted);
        } catch (err) {
            console.error('RESULTS_FETCH_FAILURE:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (filteredResults.length === 0) return;

        // Convert to CSV
        const headers = ['Student Name', 'Exam', 'Score', 'Feedback'];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + filteredResults.map(r => `"${r.studentName}","${r.examTitle}","${r.score}","${r.feedback.replace(/"/g, '""')}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sefaes_results_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!schoolId) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800">No School Registered</h2>
                <p className="mt-2 text-slate-600">Please register a school first.</p>
            </div>
        );
    }

    const filteredExams = selectedClass
        ? exams.filter(e => e.class_id === selectedClass)
        : exams;

    const filteredResults = results.filter(r => {
        let matchClass = true;
        let matchExam = true;
        let matchSearch = true;

        if (selectedClass) {
            matchClass = r.classId === selectedClass;
        }
        if (selectedExam) {
            matchExam = r.examId === selectedExam;
        }
        if (searchQuery) {
            matchSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return matchClass && matchExam && matchSearch;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Grading Results</h2>
                    <p className="text-slate-500">View, filter, and export student performance data.</p>
                </div>
                <div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <DownloadCloud className="w-5 h-5" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center space-x-2 text-slate-700 md:mr-4">
                    <Filter className="w-5 h-5" />
                    <span className="font-semibold text-sm">Filters:</span>
                </div>

                <select
                    value={selectedClass}
                    onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedExam(''); // Reset exam when class changes
                    }}
                    className="w-full md:w-48 rounded-xl border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Classes</option>
                    {(classes ?? []).map(c => (
                        <option key={c.id} value={c.id}>{c.class_name}</option>
                    ))}
                </select>

                <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full md:w-64 rounded-xl border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Exams</option>
                    {(filteredExams ?? []).map(e => (
                        <option key={e.id} value={e.id}>{e.exam_title}</option>
                    ))}
                </select>

                <div className="w-full md:flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student name..."
                        className="pl-10 w-full rounded-xl border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-full py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="ml-3 text-slate-500 font-medium">Loading results...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Feedback</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {(filteredResults ?? []).length > 0 ? (filteredResults ?? []).map((result) => (
                                    <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                            {result.studentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {result.examTitle}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${result.score >= 50 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                {result.score} / 100
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="max-w-md max-h-20 overflow-y-auto pr-2 custom-scrollbar">
                                                {result.feedback}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <FileSearch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium">No results found matching your criteria.</p>
                                            <button onClick={() => { setSelectedClass(''); setSelectedExam(''); setSearchQuery(''); }} className="mt-2 text-sm text-indigo-600 hover:underline">Clear filters</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;
