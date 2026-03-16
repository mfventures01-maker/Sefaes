import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { performOCR } from '../services/geminiService';
import { gradingService } from '../services/gradingService';
import { identityService } from '../services/identityService';

const ScriptUpload: React.FC = () => {
    const { schoolId, teacherId, setTeacherId } = useStore();
    const [exams, setExams] = useState<{ id: string; exam_title: string; class_id: string }[]>([]);
    const [students, setStudents] = useState<{ id: string; first_name: string; last_name: string; class_id: string }[]>([]);

    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        if (!schoolId) return;

        const fetchData = async () => {
            try {
                // Ensure teacher identity is resolved
                if (!teacherId) {
                    const identity = await identityService.resolveTeacher();
                    if (identity) {
                        setTeacherId(identity.teacher_id);
                    }
                }

                const [examsData, studentsData] = await Promise.all([
                    gradingService.loadExams(schoolId),
                    gradingService.loadStudents(schoolId)
                ]);

                if (examsData) setExams(examsData as any);
                if (studentsData) setStudents(studentsData as any);
            } catch (err) {
                console.error('FETCH_DATA_ERROR:', err);
            }
        };
        fetchData();
    }, [schoolId, teacherId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setSuccess(false);
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const toBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const uploadAndProcessScripts = async () => {
        if (!selectedExamId || !selectedStudentId || files.length === 0) {
            setError('Please select an exam, student, and upload at least one image.');
            return;
        }

        if (!teacherId || !schoolId) {
            setError('Missing identity context. Please re-login.');
            return;
        }

        setIsProcessing(true);
        setStatus('Processing images...');
        setError(null);

        try {
            let combinedOcrText = '';
            let fileUrls: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setStatus(`Running OCR on file ${i + 1} of ${files.length}...`);

                // 1. Get base64 for Gemini
                const base64 = await toBase64(file);

                // 2. Perform OCR
                const text = await performOCR(base64);
                combinedOcrText += text + '\n\n';

                // 3. Upload to Supabase Storage
                setStatus(`Uploading file ${i + 1}...`);
                const fileName = `${selectedExamId}/${selectedStudentId}_${Date.now()}_${i}`;
                const { data: uploadData } = await supabase.storage
                    .from('scripts')
                    .upload(fileName, file);

                if (uploadData) {
                    const { data: urlData } = supabase.storage.from('scripts').getPublicUrl(fileName);
                    fileUrls.push(urlData.publicUrl);
                }
            }

            setStatus('Saving record...');

            // 4. Save to Answer Scripts database table using Canonical Signal
            await gradingService.createAnswerScript({
                p_student_id: selectedStudentId,
                p_exam_id: selectedExamId,
                p_teacher_id: teacherId,
                p_school_id: schoolId,
                p_ocr_text: combinedOcrText,
                p_file_url: fileUrls[0] // Just taking the first one as primary for now
            });

            setSuccess(true);
            setFiles([]);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred during upload/processing.');
        } finally {
            setIsProcessing(false);
            setStatus('');
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

    // Filter students based on the selected exam's class
    const selectedExam = exams.find(e => e.id === selectedExamId);
    const filteredStudents = selectedExam
        ? students.filter(s => s.class_id === selectedExam.class_id)
        : students;

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
                            onChange={(e) => {
                                setSelectedExamId(e.target.value);
                                setSelectedStudentId('');
                            }}
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

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 mb-6 flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-200 mb-6 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Script successfully digitized and queued for AI grading!
                    </div>
                )}

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:border-indigo-400 transition-colors relative cursor-pointer">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
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
                                <span>{status}</span>
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
