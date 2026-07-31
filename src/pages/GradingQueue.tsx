import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { Loader2, Play, CheckCircle, BrainCircuit, AlertCircle, RefreshCw } from 'lucide-react';
import { CommandBus } from '../lib/CommandBus';
import { COMMANDS } from '../lib/commandRegistry';
import type { CommandError } from '../lib/commandTypes';

const GradingQueue: React.FC = () => {
    const { schoolId } = useStore();
    const [pendingScripts, setPendingScripts] = useState<any[]>([]);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [commandError, setCommandError] = useState<CommandError | null>(null);

    const bus = CommandBus.getInstance();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [schoolId]);

    const fetchData = async () => {
        if (!schoolId) return;
        try {
            const result = await bus.dispatch({
                type: COMMANDS.GRADING_STATUS_READ,
                payload: {}
            });
            const { pendingScripts: scripts, activeJobs: jobs } = result ?? { pendingScripts: [], activeJobs: [] };
            setPendingScripts(scripts ?? []);
            setActiveJobs(jobs ?? []);

            if ((jobs ?? []).length === 0 && isProcessing) {
                setIsProcessing(false);
                setStatus('Grading session complete!');
            }
        } catch (err: any) {
            console.error('[GRADING_QUEUE] fetchData:', err.message);
        }
    };

    const startGrading = async () => {
        if (pendingScripts.length === 0) return;
        setIsProcessing(true);
        setCommandError(null);
        setStatus('Triggering AI Workers...');

        try {
            await bus.dispatch({
                type: COMMANDS.GRADING_START,
                payload: { examId: pendingScripts[0]?.exam_id }
            });
            setStatus('Worker triggered. Polling for updates...');
        } catch (err: any) {
            setCommandError({
                message: err.message,
                code: 'GRADING_FAILED',
                traceId: `SEFAES-GRADE-${Date.now().toString(36).toUpperCase()}`,
            });
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

                {commandError && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 mb-6 text-left">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{commandError.message}</p>
                                <p className="text-xs text-red-400 mt-1 font-mono">Ref: {commandError.traceId}</p>
                            </div>
                        </div>
                        <button
                            onClick={startGrading}
                            className="mt-3 flex items-center gap-1 text-xs text-red-600 font-bold hover:underline"
                        >
                            <RefreshCw className="w-3 h-3" /> Retry
                        </button>
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
                                className="bg-indigo-600 h-4 transition-all duration-300"
                                style={{ width: `${totalInQueue > 0 ? (completedCount / totalInQueue) * 100 : 0}%` }}
                            />
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
