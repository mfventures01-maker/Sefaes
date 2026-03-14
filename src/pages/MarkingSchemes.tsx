import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { ShieldCheck, FileText, Loader2, BookOpen } from 'lucide-react';

interface MarkingScheme {
    id: string;
    questionNumber: number;
    maxScore: number;
    referenceAnswer: string;
    customRules?: any;
}

const MarkingSchemes: React.FC = () => {
    const { schoolId } = useStore();
    const [exams, setExams] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [markingScheme, setMarkingScheme] = useState<MarkingScheme | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (schoolId) {
            fetchExams();
        } else {
            setLoading(false);
        }
    }, [schoolId]);

    const fetchExams = async () => {
        try {
            // Need to find exams that belong to classes in this school
            const { data, error } = await supabase
                .from('exams')
                .select(`
          id,
          exam_title,
          marking_scheme,
          classes!inner (
            school_id
          )
        `)
                .eq('classes.school_id', schoolId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setExams(data || []);
            if (data && data.length > 0) {
                setSelectedExamId(data[0].id);
                setMarkingScheme(data[0].marking_scheme);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExamChange = (examId: string) => {
        setSelectedExamId(examId);
        const exam = exams.find(e => e.id === examId);
        setMarkingScheme(exam?.marking_scheme || null);
    };

    if (!schoolId) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800">No School Registered</h2>
                <p className="mt-2 text-slate-600">Please register a school first.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Marking Schemes</h2>
                <p className="text-slate-500">View the AI grading rules associated with each exam.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Exam</label>
                    <select
                        value={selectedExamId}
                        onChange={(e) => handleExamChange(e.target.value)}
                        className="w-full md:w-1/2 rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                    >
                        {exams.length === 0 && <option value="">No exams available</option>}
                        {(exams ?? []).map(exam => (
                            <option key={exam.id} value={exam.id}>{exam.exam_title}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="ml-3 text-slate-500 font-medium">Loading schema...</span>
                    </div>
                ) : markingScheme ? (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Schema Details</h3>
                                <p className="text-sm text-slate-500">Parameters used by the SEFAES Vision AI for evaluation</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="grid grid-cols-2 mb-4 gap-4">
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Question Details</span>
                                    <p className="text-lg font-bold text-slate-900 mt-1">ID: {markingScheme.id || 'Main Essay'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Max Score</span>
                                    <p className="text-lg font-bold text-slate-900 mt-1 text-indigo-600">{markingScheme.maxScore} points</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <span className="text-xs font-semibold text-slate-500 uppercase">Reference Answer</span>
                                <div className="mt-2 bg-white p-4 rounded-lg border border-slate-200 text-slate-700 text-sm italic">
                                    "{markingScheme.referenceAnswer}"
                                </div>
                            </div>

                            {markingScheme.customRules && (
                                <div className="mt-6 border-t border-slate-200 pt-6">
                                    <span className="text-xs font-semibold text-slate-500 uppercase mb-3 block">Semantic Rules & Constraints</span>
                                    <ul className="space-y-3">
                                        {markingScheme.customRules.strictGrammar && (
                                            <li className="flex items-start">
                                                <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-600 rounded-full mr-3 mt-0.5"><CheckIcon className="w-3 h-3" /></span>
                                                <span className="text-sm text-slate-700 font-medium">Enforce Strict Grammar Check</span>
                                            </li>
                                        )}
                                        {markingScheme.customRules.penalizeRepetition && (
                                            <li className="flex items-start">
                                                <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-600 rounded-full mr-3 mt-0.5"><CheckIcon className="w-3 h-3" /></span>
                                                <span className="text-sm text-slate-700 font-medium">Penalize Repetition (Severity: {markingScheme.customRules.repetitionSeverity || 'Medium'})</span>
                                            </li>
                                        )}
                                        {markingScheme.customRules.requireStructure && (
                                            <li className="flex flex-col mt-2">
                                                <div className="flex items-start">
                                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-600 rounded-full mr-3 mt-0.5"><CheckIcon className="w-3 h-3" /></span>
                                                    <span className="text-sm text-slate-700 font-medium">Require specific essay structure</span>
                                                </div>
                                                <div className="ml-8 mt-1 text-xs text-slate-500 bg-white p-2 rounded border border-slate-100 italic">
                                                    {markingScheme.customRules.structureComponents || 'Introduction, Body, Conclusion'}
                                                </div>
                                            </li>
                                        )}
                                        {markingScheme.customRules.toneExpectation && (
                                            <li className="flex flex-col mt-2">
                                                <div className="flex items-start">
                                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full mr-3 mt-0.5"><FileText className="w-3 h-3" /></span>
                                                    <span className="text-sm text-slate-700 font-medium">Expected Tone</span>
                                                </div>
                                                <div className="ml-8 mt-1 text-xs text-slate-500 bg-white p-2 rounded border border-slate-100 italic">
                                                    "{markingScheme.customRules.toneExpectation}"
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Select an exam to view its marking scheme.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

export default MarkingSchemes;
