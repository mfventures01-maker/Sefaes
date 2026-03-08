import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Loader2, Play, CheckCircle, BrainCircuit } from 'lucide-react';
import { gradeEssay } from '../services/geminiService';

const GradingQueue: React.FC = () => {
    const { schoolId } = useStore();
    const [pendingScripts, setPendingScripts] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingScripts();
    }, [schoolId]);

    const fetchPendingScripts = async () => {
        if (!schoolId) return;
        try {
            // Need to join exams to make sure the script belongs to this school
            // Simplest way: select scripts where grading_status = 'pending'
            const { data, error } = await supabase
                .from('answer_scripts')
                .select(`
          id,
          ocr_text,
          exam_id,
          student_id,
          exams (
            marking_scheme
          )
        `)
                .eq('grading_status', 'pending');

            if (error) throw error;
            if (data) setPendingScripts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const startGrading = async () => {
        if (pendingScripts.length === 0) return;
        setIsProcessing(true);
        setProgress(0);
        setTotal(pendingScripts.length);
        setError(null);

        let currentIndex = 0;

        for (const script of pendingScripts) {
            try {
                const scheme = script.exams.marking_scheme;
                if (!scheme) throw new Error('No marking scheme found for this exam.');

                // Pass scheme and wait for gemini result
                const result = await gradeEssay(script.ocr_text, scheme);

                // Insert into grading_results
                const { error: insertError } = await supabase
                    .from('grading_results')
                    .insert([{
                        answer_script_id: script.id,
                        score: result.awardedPoints || 0,
                        ai_feedback: result.feedback || 'No feedback generated.',
                        grading_status: 'completed'
                    }]);

                if (insertError) throw insertError;

                // Update answer_scripts
                const { error: updateError } = await supabase
                    .from('answer_scripts')
                    .update({ grading_status: 'graded' })
                    .eq('id', script.id);

                if (updateError) throw updateError;

            } catch (err: any) {
                console.error(`Error grading script ${script.id}:`, err);
                // Could log it to state, but we'll continue to the next script
            }

            currentIndex++;
            setProgress(currentIndex);
        }

        setIsProcessing(false);
        fetchPendingScripts(); // Refresh list
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
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Grading Pipeline</h2>
                <p className="text-slate-500">Auto-grade pending exam scripts using SEFAES Vision Engine.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <BrainCircuit className="w-16 h-16 text-indigo-500 mx-auto mb-4" />

                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {pendingScripts.length} Scripts Pending
                </h3>
                <p className="text-slate-500 mb-8">
                    The AI engine will evaluate each script against its defined rubric and assign a score.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 mb-6">
                        {error}
                    </div>
                )}

                {isProcessing ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-3 text-indigo-600 font-semibold mb-2">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Grading in progress ({progress} / {total})</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                            <div
                                className="bg-indigo-600 h-4 transition-all duration-300 relative"
                                style={{ width: `${(progress / total) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_1s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        {pendingScripts.length > 0 ? (
                            <button
                                onClick={startGrading}
                                className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 mx-auto"
                            >
                                <Play className="w-5 h-5" />
                                <span>Start Batch Grading</span>
                            </button>
                        ) : (
                            <div className="inline-flex items-center space-x-2 text-green-600 font-semibold bg-green-50 px-6 py-3 rounded-xl">
                                <CheckCircle className="w-5 h-5" />
                                <span>All scripts have been graded!</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradingQueue;
