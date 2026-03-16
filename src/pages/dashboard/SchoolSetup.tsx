import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { onboardingService } from '../../services/onboardingService';
import { Layout, BookOpen, Users, PlusCircle, CheckCircle, Loader2 } from 'lucide-react';

const SchoolSetup: React.FC = () => {
    const { schoolId } = useStore();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'teachers'>('classes');
    const [success, setSuccess] = useState<string | null>(null);

    // Form States
    const [className, setClassName] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [teacherName, setTeacherName] = useState('');

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onboardingService.createClass({
                name: className,
                school_id: schoolId!
            });
            setSuccess(`Class ${className} created!`);
            setClassName('');
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to create class");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onboardingService.createSubjectInCatalog(subjectName);
            setSuccess(`Subject ${subjectName} created in catalog!`);
            setSubjectName('');
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to create subject");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onboardingService.createTeacher({
                name: teacherName,
                school_id: schoolId!,
                email: '', // placeholder for form extension
                phone: ''  // placeholder for form extension
            });
            setSuccess(`Teacher ${teacherName} added!`);
            setTeacherName('');
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to add teacher");
        } finally {
            setLoading(false);
        }
    };

    if (!schoolId) return <div className="p-10 text-center text-slate-500">Initializing School ID...</div>;

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-slate-900 mb-2">School Structure Setup</h1>
                <p className="text-slate-500">Configure your academic environment in three steps.</p>
            </div>

            <div className="flex space-x-4 mb-8">
                {(['classes', 'subjects', 'teachers'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSuccess(null); }}
                        className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${activeTab === tab
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20'
                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                            } capitalize`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white p-10">
                {success && (
                    <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-2xl border border-green-200 flex items-center animate-in fade-in slide-in-from-top-4">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {success}
                    </div>
                )}

                {activeTab === 'classes' && (
                    <form onSubmit={handleCreateClass} className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                <Layout className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Define Classes</h2>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-2">Class Name</label>
                            <input
                                required
                                value={className}
                                onChange={e => setClassName(e.target.value)}
                                placeholder="e.g. Grade 10A"
                                className="w-full bg-slate-50 border-0 rounded-2xl py-4 px-6 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-slate-800 transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PlusCircle className="mr-2 w-5 h-5" />}
                            Create Class
                        </button>
                    </form>
                )}

                {activeTab === 'subjects' && (
                    <form onSubmit={handleCreateSubject} className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Assign Subjects</h2>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-2">Subject Name</label>
                            <input
                                required
                                value={subjectName}
                                onChange={e => setSubjectName(e.target.value)}
                                placeholder="e.g. Mathematics"
                                className="w-full bg-slate-50 border-0 rounded-2xl py-4 px-6 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-slate-800 transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PlusCircle className="mr-2 w-5 h-5" />}
                            Create Subject
                        </button>
                    </form>
                )}

                {activeTab === 'teachers' && (
                    <form onSubmit={handleCreateTeacher} className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Add Teachers</h2>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-2">Teacher Name</label>
                            <input
                                required
                                value={teacherName}
                                onChange={e => setTeacherName(e.target.value)}
                                placeholder="e.g. Mrs. Smith"
                                className="w-full bg-slate-50 border-0 rounded-2xl py-4 px-6 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-slate-800 transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PlusCircle className="mr-2 w-5 h-5" />}
                            Add Teacher
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SchoolSetup;
