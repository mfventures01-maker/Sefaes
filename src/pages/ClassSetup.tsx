import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Plus, Trash2, Users, Loader2 } from 'lucide-react';

interface ClassData {
    id: string;
    class_name: string;
    school_id: string;
    created_at: string;
}

const ClassSetup: React.FC = () => {
    const { schoolId } = useStore();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [newClassName, setNewClassName] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (schoolId) {
            fetchClasses();
        } else {
            setFetching(false);
        }
    }, [schoolId]);

    const fetchClasses = async () => {
        try {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('school_id', schoolId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setClasses(data || []);
        } catch (err) {
            console.error('Error fetching classes:', err);
        } finally {
            setFetching(false);
        }
    };

    const handeAddClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim() || !schoolId) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('classes')
                .insert([{ class_name: newClassName.trim(), school_id: schoolId }])
                .select();

            if (error) throw error;

            if (data) {
                setClasses([...classes, data[0]]);
                setNewClassName('');
            }
        } catch (err) {
            console.error('Error adding class:', err);
            alert('Failed to add class.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm('Are you sure you want to delete this class?')) return;

        try {
            const { error } = await supabase
                .from('classes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setClasses(classes.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting class:', err);
            alert('Failed to delete class.');
        }
    };

    if (!schoolId) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800">No School Registered</h2>
                <p className="mt-2 text-slate-600">Please register a school first to manage classes.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Class Management</h2>
                    <p className="text-slate-500">Create and manage classes (e.g. JSS1, SS2, etc.)</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handeAddClass} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="e.g. JSS1 A"
                            className="w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        <span>Add Class</span>
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {fetching ? (
                    <div className="flex justify-center items-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="ml-3 text-slate-500 font-medium">Loading classes...</span>
                    </div>
                ) : classes.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                        {classes.map((cls) => (
                            <li key={cls.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">{cls.class_name}</h4>
                                        <p className="text-sm text-slate-500">ID: {cls.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteClass(cls.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No classes added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassSetup;
