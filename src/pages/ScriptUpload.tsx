import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { UploadCloud, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { CommandBus } from '../lib/CommandBus';
import { COMMANDS } from '../lib/commandRegistry';
import { generateTraceId } from '../lib/traceId';
import { registerJob, transitionJob, failJob, getJob } from '../lib/scriptPipeline';
import type { CommandError, ScriptPipelineState } from '../lib/commandTypes';

// ── Pipeline State Label Map ─────────────────────────────────────────────────
const STATE_LABELS: Record<ScriptPipelineState, string> = {
    uploaded:       'Files ready',
    ocr_processing: 'Reading handwriting...',
    ocr_complete:   'Handwriting extracted',
    grading:        'Saving for AI grading...',
    graded:         'Script queued for AI grading!',
    failed:         'Processing failed',
};

// ── Component ────────────────────────────────────────────────────────────────
const ScriptUpload: React.FC = () => {
    const { schoolId, teacherId, setTeacherId } = useStore();
    const [exams, setExams] = useState<{ id: string; exam_title: string; class_id: string }[]>([]);
    const [students, setStudents] = useState<{ id: string; first_name: string; last_name: string; class_id: string }[]>([]);

    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const [jobId, setJobId] = useState<string | null>(null);
    const [pipelineState, setPipelineState] = useState<ScriptPipelineState | null>(null);
    const [commandError, setCommandError] = useState<CommandError | null>(null);

    const bus = CommandBus.getInstance();

    useEffect(() => {
        if (!schoolId) return;
        const fetchData = async () => {
            try {
                if (!teacherId) {
                    const identity = await bus.dispatch({
                        type: COMMANDS.IDENTITY_RESOLVE_TEACHER,
                        payload: {}
                    });
                    if (identity) setTeacherId(identity.teacher_id);
                }

                const [examsData, studentsData] = await Promise.all([
                    bus.dispatch({ type: COMMANDS.EXAMS_READ, payload: { schoolId } }),
                    bus.dispatch({ type: COMMANDS.STUDENTS_READ, payload: { schoolId } }),
                ]);

                if (examsData) setExams(examsData as any);
                if (studentsData) setStudents(studentsData as any);
            } catch (err: any) {
                // Errors from dispatch are already user-safe
                console.error('FETCH_DATA_ERROR:', err.message);
            }
        };
        fetchData();
    }, [schoolId, teacherId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCommandError(null);
        setPipelineState(null);
        setJobId(null);
        if (e.target.files) setFiles(Array.from(e.target.files));
    };

    const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (err) => reject(err);
        });

    const uploadAndProcessScripts = async () => {
        if (!selectedExamId || !selectedStudentId || files.length === 0) {
            setCommandError({
                message: 'Please select an exam, student, and upload at least one image.',
                code: 'MISSING_SELECTION',
                traceId: generateTraceId('UPLOAD'),
            });
            return;
        }
        if (!teacherId || !schoolId) {
            setCommandError({
                message: 'Your session is missing identity context. Please log out and back in.',
                code: 'MISSING_IDENTITY',
                traceId: generateTraceId('IDENTITY'),
            });
            return;
        }

        const traceId = generateTraceId('UPLOAD');

        // ── Register job in pipeline FSM ───────────────────────────────────
        const job = registerJob({
            jobId: traceId,
            traceId,
            studentId: selectedStudentId,
            examId: selectedExamId,
            teacherId,
            schoolId,
            fileUrl: '',
        });
        setJobId(job.jobId);
        setPipelineState('uploaded');
        setCommandError(null);

        try {
            // ── Step 1: OCR ────────────────────────────────────────────────
            transitionJob(traceId, 'ocr_processing');
            setPipelineState('ocr_processing');

            let combinedOcrText = '';
            let firstFileUrl = '';

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const base64 = await toBase64(file);

                // OCR via Gemini routed through the CommandBus FSM
                const ocrResult = await bus.dispatch({
                    type: COMMANDS.OCR_PROCESS,
                    payload: { base64 }
                });
                const text = ocrResult?.text || ocrResult || "";
                combinedOcrText += text + '\n\n';

                // Upload to storage via CommandBus
                const publicUrl = await bus.dispatch({
                    type: COMMANDS.STORAGE_UPLOAD,
                    payload: {
                        fileName: `${selectedExamId}/${selectedStudentId}_${Date.now()}_${i}`,
                        file,
                    }
                });
                if (i === 0) firstFileUrl = publicUrl;
            }

            transitionJob(traceId, 'ocr_complete', { ocrText: combinedOcrText });
            setPipelineState('ocr_complete');

            // ── Step 2: Persist answer script ──────────────────────────────
            transitionJob(traceId, 'grading');
            setPipelineState('grading');

            await bus.dispatch({
                type: COMMANDS.ANSWER_SCRIPTS_CREATE,
                payload: {
                    p_student_id: selectedStudentId,
                    p_exam_id: selectedExamId,
                    p_teacher_id: teacherId,
                    p_school_id: schoolId,
                    p_ocr_text: combinedOcrText,
                    p_file_url: firstFileUrl,
                }
            });

            transitionJob(traceId, 'graded');
            setPipelineState('graded');
            setFiles([]);
        } catch (err: any) {
            const errTrace = getJob(traceId)?.traceId ?? traceId;
            const commandErr: CommandError = {
                message: err.message ?? `Upload failed. Reference: ${errTrace}`,
                code: 'SCRIPT_PIPELINE_FAILURE',
                traceId: errTrace,
            };
            failJob(traceId, commandErr);
            setPipelineState('failed');
            setCommandError(commandErr);
        }
    };

    const handleRetry = () => {
        setCommandError(null);
        setPipelineState(null);
        setJobId(null);
    };

    if (!schoolId) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800">No School Registered</h2>
                <p className="mt-2 text-slate-600">Please register a school first.</p>
            </div>
        );
    }

    const selectedExam = exams.find(e => e.id === selectedExamId);
    const filteredStudents = selectedExam
        ? students.filter(s => s.class_id === selectedExam.class_id)
        : students;

    const isProcessing = pipelineState !== null && pipelineState !== 'graded' && pipelineState !== 'failed';
    const isSuccess = pipelineState === 'graded';
    const isFailed = pipelineState === 'failed';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upload Exam Scripts</h2>
                <p className="text-slate-500">Capture images of student responses to digitize and grade.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Exam</label>
                        <select
                            value={selectedExamId}
                            onChange={(e) => { setSelectedExamId(e.target.value); setSelectedStudentId(''); }}
                            className="w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Choose Exam...</option>
                            {(exams ?? []).map(e => (
                                <option key={e.id} value={e.id}>{e.exam_title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Student</label>
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            disabled={!selectedExamId}
                            className="w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-50"
                        >
                            <option value="">Choose Student...</option>
                            {(filteredStudents ?? []).map(s => (
                                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pipeline status banner */}
                {pipelineState && !commandError && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
                        isSuccess
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                        {isSuccess
                            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            : <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                        }
                        <span>{STATE_LABELS[pipelineState]}</span>
                    </div>
                )}

                {/* User-safe error banner */}
                {commandError && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{commandError.message}</p>
                                <p className="text-xs text-red-500 mt-1 font-mono">Ref: {commandError.traceId}</p>
                            </div>
                        </div>
                        {isFailed && (
                            <button
                                onClick={handleRetry}
                                className="mt-3 flex items-center gap-1 text-xs text-red-600 font-bold hover:underline"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Try again
                            </button>
                        )}
                    </div>
                )}

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:border-indigo-400 transition-colors relative cursor-pointer">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        disabled={isProcessing}
                    />
                    <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-slate-900">Drop Images Here</h4>
                    <p className="text-slate-500 text-sm mt-1">Upload multiple pages for the same student.</p>
                    {files.length > 0 && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 inline-block">
                            <p className="font-semibold text-indigo-600">{files.length} file(s) selected.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={uploadAndProcessScripts}
                        disabled={isProcessing || !files.length || !selectedExamId || !selectedStudentId}
                        className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{STATE_LABELS[pipelineState!]}</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-5 h-5" />
                                <span>Upload & Run OCR</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScriptUpload;
