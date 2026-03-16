import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Plus, Trash2, Library, Loader2, BookOpen } from 'lucide-react';

interface SubjectData {
    id: string;
    name: string;
    class_id: string;
    classes?: {
        name: string;
    };
}

interface ClassData {
    id: string;
    name: string;
}

const SubjectManagement: React.FC = () => {
    const { schoolId } = useStore();
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (schoolId) {
            fetchData();
        } else {
            setFetching(false);
        }
    }, [schoolId]);

    const fetchData = async () => {
        try {
            const [classesRes, subjectsRes] = await Promise.all([
                supabase.from('classes').select('id, name').eq('school_id', schoolId).order('created_at'),
                supabase
                    .from('class_subjects')
                    .select(`
                        id,
                        class_id,
                        subject_id,
                        subject_catalog!inner(name),
                        classes!inner (
                            name,
                            school_id
                        )
                    `)
                    .eq('classes.school_id', schoolId)
                    .order('classes(name)')
            ]);

            if (classesRes.data) setClasses(classesRes.data);
            if (subjectsRes.data) {
                // Flatten the data for the UI
                const flattened = subjectsRes.data.map((s: any) => ({
                    id: s.id,
                    name: s.subject_catalog.name,
                    class_id: s.class_id,
                    classes: s.classes
                }));
                setSubjects(flattened);
            }
        } catch (err) {
            console.error('Error fetching subjects data:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubjectName.trim() || !selectedClassId) return;

        setLoading(true);
        try {
            // Step 1: Ensure subject exists in catalog
            let subjectId;
            const { data: existing } = await supabase
                .from('subject_catalog')
                .select('id')
                .eq('name', newSubjectName.trim())
                .maybeSingle();

            if (existing) {
                subjectId = existing.id;
            } else {
                const { data: created, error: createError } = await supabase
                    .from('subject_catalog')
                    .insert({ name: newSubjectName.trim() })
                    .select()
                    .single();
                if (createError) throw createError;
                subjectId = created.id;
            }

            // Step 2: Assign to class
            const { data, error } = await supabase
                .from('class_subjects')
                .insert([{ 
                    subject_id: subjectId, 
                    class_id: selectedClassId,
                    school_id: schoolId 
                }])
                .select(`
                    id,
                    class_id,
                    subject_id,
                    subject_catalog!inner(name),
                    classes!inner(name)
                `)
                .single();

            if (error) throw error;

            if (data) {
                const newEntry = {
                    id: data.id,
                    name: (data as any).subject_catalog.name,
                    class_id: data.class_id,
                    classes: (data as any).classes
                };
                setSubjects([...subjects, newEntry]);
                setNewSubjectName('');
                setSelectedClassId('');
            }
        } catch (err) {
            console.error('Error adding subject:', err);
            alert('Failed to add subject.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subject assignment?')) return;

        try {
            const { error } = await supabase
                .from('class_subjects')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSubjects(subjects.filter(s => s.id !== id));
        } catch (err) {
            console.error('Error deleting subject:', err);
            alert('Failed to delete subject assignment.');
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
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Subject Management</h2>
                    <p className="text-slate-500">Assign subjects to classes.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleAddSubject} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="">Select Class...</option>
                            {(classes ?? []).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <input
                            type="text"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="e.g. Mathematics"
                            className="w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                        <button
                            type="submit"
                            disabled={loading || !selectedClassId || !newSubjectName}
                            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            <span>Add Subject</span>
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {fetching ? (
                    <div className="flex justify-center items-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="ml-3 text-slate-500 font-medium">Loading subjects...</span>
                    </div>
                ) : subjects.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                        {(subjects ?? []).map((subj) => (
                            <li key={subj.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">{subj.name}</h4>
                                        <p className="text-sm text-slate-500">
                                            Class: <span className="font-semibold">{subj.classes?.name || 'Unknown'}</span> | ID: {subj.id}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteSubject(subj.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16">
                        <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No subjects added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectManagement;
