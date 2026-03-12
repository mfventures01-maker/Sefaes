import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { FileText, Loader2, PlusCircle, Check, Trash2 } from 'lucide-react';
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

    const [rubric, setRubric] = useState<{ criterion: string; marks: number }[]>([
        { criterion: '', marks: 5 }
    ]);

    const addCriterion = () => setRubric([...rubric, { criterion: '', marks: 5 }]);
    const removeCriterion = (index: number) => {
        const newRubric = [...rubric];
        newRubric.splice(index, 1);
        setRubric(newRubric);
    };

    const updateCriterion = (index: number, field: 'criterion' | 'marks', value: any) => {
        const newRubric = [...rubric];
        newRubric[index] = { ...newRubric[index], [field]: value };
        setRubric(newRubric);
    };

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId) return;

        setLoading(true);
        setSuccess(false);
        setError(null);

        try {
            // Simplified Rubric Structure for Gemini
            const markingScheme = {
                rubric: rubric.filter(r => r.criterion.trim() !== ''),
                maxScore: rubric.reduce((acc, curr) => acc + Number(curr.marks), 0)
            };

            if (markingScheme.rubric.length === 0) throw new Error('Add at least one rubric criterion');

            const { error: insertError } = await supabase
                .from('exams')
                .insert([{
                    exam_title: formData.exam_title,
                    subject_id: formData.subject_id,
                    class_id: formData.class_id,
                    exam_date: formData.exam_date,
                    marking_scheme: markingScheme
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
            setRubric([{ criterion: '', marks: 5 }]);
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
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-bold text-slate-700">Marking Rubric</label>
                            <button
                                type="button"
                                onClick={addCriterion}
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
                            >
                                <PlusCircle className="w-4 h-4 mr-1" />
                                Add Criterion
                            </button>
                        </div>

                        <div className="space-y-4">
                            {rubric.map((r, index) => (
                                <div key={index} className="flex items-center space-x-4 animate-in fade-in duration-300">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Criterion Name (e.g. Content)"
                                            value={r.criterion}
                                            onChange={(e) => updateCriterion(index, 'criterion', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 border p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <input
                                            type="number"
                                            placeholder="Max Marks"
                                            value={r.marks}
                                            onChange={(e) => updateCriterion(index, 'marks', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 border p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeCriterion(index)}
                                        className="text-slate-400 hover:text-red-500 p-2"
                                        disabled={rubric.length === 1}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-right text-sm font-bold text-slate-500">
                            Total Marks: {rubric.reduce((acc, curr) => acc + Number(curr.marks), 0)}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            <span>Create Exam</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default ExamCreation;
