import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Loader2, Play, CheckCircle, BrainCircuit } from 'lucide-react';
import { gradeEssay } from '../services/geminiService';

const GradingQueue: React.FC = () => {
    const { schoolId } = useStore();
    const [pendingScripts, setPendingScripts] = useState<any[]>([]);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [schoolId]);

    const fetchData = async () => {
        if (!schoolId) return;
        try {
            // 1. Fetch scripts that aren't graded yet
            const scriptsRes = await supabase
                .from('answer_scripts')
                .select('id, grading_status')
                .eq('grading_status', 'pending');

            if (scriptsRes.data) setPendingScripts(scriptsRes.data);

            // 2. Fetch active jobs to show progress
            const jobsRes = await supabase
                .from('grading_jobs')
                .select('id, status, script_id')
                .in('status', ['pending', 'processing']);

            if (jobsRes.data) setActiveJobs(jobsRes.data);

            if (jobsRes.data?.length === 0 && isProcessing) {
                setIsProcessing(false);
                setStatus('Grading session complete!');
            }
        } catch (err) {
            console.error('FETCH_DATA_FAILURE:', err);
        }
    };

    const startGrading = async () => {
        if (pendingScripts.length === 0) return;
        setIsProcessing(true);
        setError(null);
        setStatus('Enqueuing scripts...');

        try {
            // 1. Create jobs for all pending scripts
            const jobEntries = pendingScripts.map(s => ({
                script_id: s.id,
                status: 'pending'
            }));

            const { error: queueError } = await supabase
                .from('grading_jobs')
                .insert(jobEntries);

            if (queueError) throw queueError;

            // 2. Update script status to queued
            const { error: updateError } = await supabase
                .from('answer_scripts')
                .update({ grading_status: 'queued' })
                .in('id', pendingScripts.map(s => s.id));

            if (updateError) throw updateError;

            // 3. Trigger initial worker run
            setStatus('Worker triggered...');
            await supabase.functions.invoke('grade-script');

        } catch (err: any) {
            console.error('START_GRADING_FAILURE:', err);
            setError(err.message);
            setIsProcessing(false);
        }
    };

    if (!schoolId) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800">No School Registered</h2>
                <p className="mt-2 text-slate-600">Please register a school first.</p>
            </div>
        );
    }

    const totalInQueue = pendingScripts.length + activeJobs.length;
    const completedCount = totalInQueue - activeJobs.length;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Grading Pipeline</h2>
                <p className="text-slate-500">Asynchronous batch grading using distributed workers.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <BrainCircuit className="w-16 h-16 text-indigo-500 mx-auto mb-4" />

                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {totalInQueue} Scripts in Pipeline
                </h3>
                <p className="text-slate-500 mb-8">
                    {activeJobs.length} jobs currently processing or pending in the cloud.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 mb-6">
                        {error}
                    </div>
                )}

                {activeJobs.length > 0 || isProcessing ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-3 text-indigo-600 font-semibold mb-2">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>{status || `Processing (${completedCount} / ${totalInQueue})`}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                            <div
                                className="bg-indigo-600 h-4 transition-all duration-300 relative"
                                style={{ width: `${(completedCount / totalInQueue) * 100}%` }}
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
                                <span>Start Distributed Grading</span>
                            </button>
                        ) : (
                            <div className="inline-flex items-center space-x-2 text-green-600 font-semibold bg-green-50 px-6 py-3 rounded-xl">
                                <CheckCircle className="w-5 h-5" />
                                <span>All scripts are up to date!</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradingQueue;
