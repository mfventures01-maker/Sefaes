import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useStore } from '../lib/store';
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { onboardingService } from '../services/onboardingService';

interface StudentRow {
    first_name: string;
    last_name: string;
    gender: 'male' | 'female';
    student_number: string;
    class_id: string;
    date_of_birth?: string;
}

const StudentUpload: React.FC = () => {
    const { schoolId } = useStore();
    const [selectedClassId, setSelectedClassId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState<number>(0);
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            if (!schoolId) return;
            const data = await onboardingService.getClasses(schoolId);
            if (data) setClasses(data as any);
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
        if (!file || !selectedClassId) {
            setError('Please select a class and an upload file.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setSuccessCount(0);

        Papa.parse<any>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const validData = results.data
                        .filter((row) => row.first_name && row.last_name && row.student_number)
                        .map((row) => ({
                            first_name: row.first_name,
                            last_name: row.last_name,
                            gender: row.gender || 'male',
                            student_number: row.student_number,
                            date_of_birth: row.date_of_birth,
                            class_id: selectedClassId
                        }));

                    if (validData.length === 0) {
                        throw new Error('No valid rows found. Ensure CSV has headers: first_name, last_name, student_number, gender, date_of_birth');
                    }

                    await onboardingService.bulkEnrollStudents(validData, schoolId!);

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
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Roster Import</h2>
                <p className="text-slate-500">Bulk upload students via CSV to classes.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Target Class</label>
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full md:w-1/2 rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Choose Class...</option>
                        {(classes ?? []).map(c => (
                            <option key={c.id} value={c.id}>{(c as any).name}</option>
                        ))}
                    </select>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center transition-colors hover:border-indigo-400 bg-slate-50 relative">
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
                            <p className="text-slate-500">Required Headers: first_name, last_name, student_number, gender, date_of_birth</p>
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
                        disabled={!file || !selectedClassId || isProcessing}
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
                                <span>Import Students</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default StudentUpload;
