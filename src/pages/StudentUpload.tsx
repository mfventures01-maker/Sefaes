import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface StudentRow {
    student_name: string;
    student_id: string; // the school's internal registration number
    class_id: string;
}

const StudentUpload: React.FC = () => {
    const { schoolId } = useStore();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState<number>(0);
    const [classes, setClasses] = useState<{ id: string; class_name: string }[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            if (!schoolId) return;
            const { data } = await supabase.from('classes').select('id, class_name').eq('school_id', schoolId);
            if (data) setClasses(data);
        };
        fetchClasses();
    }, [schoolId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setSuccessCount(0);
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setSuccessCount(0);

        Papa.parse<StudentRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const validData = results.data.filter(
                        (row) => row.student_name && row.student_id && row.class_id
                    );

                    if (validData.length === 0) {
                        throw new Error('No valid rows found. Ensure CSV has headers: student_name, student_id, class_id');
                    }

                    const { error: insertError } = await supabase
                        .from('students')
                        .insert(validData);

                    if (insertError) throw insertError;

                    setSuccessCount(validData.length);
                    setFile(null);
                } catch (err: any) {
                    console.error(err);
                    setError(err.message || 'Failed to upload students.');
                } finally {
                    setIsProcessing(false);
                }
            },
            error: (err) => {
                setError(`Failed to parse CSV: ${err.message}`);
                setIsProcessing(false);
            }
        });
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
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Roster Upload</h2>
                <p className="text-slate-500">Bulk upload students via CSV to classes.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="mb-8 p-4 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-100">
                    <h4 className="font-bold flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Note on Class IDs</h4>
                    <p className="mt-2 text-sm max-h-32 overflow-y-auto">
                        Please copy the specific class ID for the `class_id` column in your CSV.
                        <br /><br />
                        <strong>Your Classes:</strong><br />
                        {classes.length === 0 ? 'No classes found.' : classes.map(c => (
                            <span key={c.id} className="block mt-1 font-mono text-xs">{c.class_name}: <span className="font-bold">{c.id}</span></span>
                        ))}
                    </p>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center transition-colors hover:border-indigo-400 bg-slate-50">
                    {file ? (
                        <div className="space-y-4 py-4">
                            <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
                            <p className="text-lg font-bold text-slate-900">{file.name}</p>
                            <button
                                onClick={() => setFile(null)}
                                className="text-red-500 text-sm hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 py-8 relative cursor-pointer">
                            <input
                                type="file"
                                accept=".csv"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                            <Upload className="w-12 h-12 text-indigo-300 mx-auto" />
                            <p className="text-lg font-medium text-slate-900">Drop CSV file here</p>
                            <p className="text-slate-500">Headers: student_name, student_id, class_id</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
                        {error}
                    </div>
                )}

                {successCount > 0 && (
                    <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-200 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Successfully imported {successCount} students.
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={!file || isProcessing}
                        className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                <span>Upload CSV</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentUpload;
