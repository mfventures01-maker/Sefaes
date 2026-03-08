import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { FileText, Loader2, PlusCircle, Check } from 'lucide-react';
import { MarkingScheme } from '../types';

const ExamCreation: React.FC = () => {
    const { schoolId } = useStore();
    const [classes, setClasses] = useState<{ id: string; class_name: string }[]>([]);
    const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        exam_title: '',
        subject_id: '',
        class_id: '',
        exam_date: '',
        marking_scheme: ''
    });

    useEffect(() => {
        if (!schoolId) return;

        const fetchDropdowns = async () => {
            try {
                const [clsRes, subjRes] = await Promise.all([
                    supabase.from('classes').select('*').eq('school_id', schoolId),
                    supabase.from('subjects').select('*')
                ]);

                if (clsRes.data) setClasses(clsRes.data);
                if (subjRes.data) setSubjects(subjRes.data);
            } catch (err) {
                console.error('Error fetching dropdowns', err);
            }
        };

        fetchDropdowns();
    }, [schoolId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId) return;

        setLoading(true);
        setSuccess(false);
        setError(null);

        try {
            // Validate marking scheme is valid JSON
            let parsedScheme;
            try {
                parsedScheme = JSON.parse(formData.marking_scheme);
            } catch (err) {
                throw new Error('Marking scheme must be valid JSON.');
            }

            const { error: insertError } = await supabase
                .from('exams')
                .insert([{
                    exam_title: formData.exam_title,
                    subject_id: formData.subject_id,
                    class_id: formData.class_id,
                    exam_date: formData.exam_date,
                    marking_scheme: parsedScheme
                }]);

            if (insertError) throw insertError;

            setSuccess(true);
            setFormData({
                exam_title: '',
                subject_id: '',
                class_id: '',
                exam_date: '',
                marking_scheme: ''
            });
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error creating exam.');
        } finally {
            setLoading(false);
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

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Exam</h2>
                <p className="text-slate-500">Define exam parameters and grading rubrics.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-200 flex items-center">
                            <Check className="w-5 h-5 mr-2" />
                            Exam created successfully!
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Title</label>
                            <input
                                type="text"
                                name="exam_title"
                                required
                                value={formData.exam_title}
                                onChange={handleChange}
                                className="w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. Midterm Assessment"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Date</label>
                            <input
                                type="date"
                                name="exam_date"
                                required
                                value={formData.exam_date}
                                onChange={handleChange}
                                className="w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
                            <select
                                name="class_id"
                                required
                                value={formData.class_id}
                                onChange={handleChange}
                                className="w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Class...</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.class_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                            <select
                                name="subject_id"
                                required
                                value={formData.subject_id}
                                onChange={handleChange}
                                className="w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Subject...</option>
                                <option value="temp-english-001">English Language</option>
                                <option value="temp-math-001">Mathematics</option>
                                <option value="temp-science-001">Science</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Marking Scheme (JSON format)</label>
                        <textarea
                            name="marking_scheme"
                            required
                            rows={8}
                            value={formData.marking_scheme}
                            onChange={handleChange}
                            className="w-full rounded-xl border-slate-300 border p-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                            placeholder={`{
  "referenceAnswer": "The main idea is...",
  "keywords": ["photosynthesis", "sunlight", "chlorophyll"],
  "maxScore": 10
}`}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                            <span>Create Exam</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExamCreation;
