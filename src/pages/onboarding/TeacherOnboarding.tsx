import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { teacherService, TeacherResponse } from "../../services/teacherService";
import { queryTable } from "../../lib/rpcClient";
import {
    Building,
    School,
    Users,
    Mail,
    Phone,
    UserPlus,
    Loader2,
    ArrowRight,
    AlertCircle,
    ShieldCheck,
    BookOpen
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface School {
    id: string;
    school_name: string;
    school_type: string;
}

interface ClassSubject {
    id: string;
    classes: {
        id: string;
        name: string;
    };
    subject_catalog: {
        id: string;
        name: string;
        code: string;
    };
}

interface Profile {
    id: string;
    user_id: string;
    institution_id: string;
    role: string;
}

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export const TeacherOnboarding: React.FC = () => {
    const navigate = useNavigate();
    
    // State
    const [profile, setProfile] = useState<Profile | null>(null);
    const [schools, setSchools] = useState<School[]>([]);
    const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
    const [selectedClassSubjectId, setSelectedClassSubjectId] = useState<string>("");
    
    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });
    
    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<TeacherResponse | null>(null);

    // Fetch user profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate("/login");
                    return;
                }

                const { data, error } = await supabase
                    .from("profiles")
                    .select("id, user_id, institution_id, role")
                    .eq("user_id", user.id)
                    .single();

                if (error || !data) {
                    throw new Error("Profile not found. Please complete institution setup first.");
                }

                setProfile(data);
                setIsLoading(false);
            } catch (err: any) {
                console.error("Profile fetch error:", err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // Fetch schools when profile is available
    useEffect(() => {
        if (!profile?.institution_id) return;

        const fetchSchools = async () => {
            try {
                const data = await queryTable<School>("schools", (builder) =>
                    builder
                        .select("id, school_name, school_type")
                        .eq("institution_id", profile.institution_id)
                        .order("school_name")
                );
                setSchools(data || []);
            } catch (err) {
                console.error("Schools fetch error:", err);
            }
        };

        fetchSchools();
    }, [profile?.institution_id]);

    // Fetch class subjects when school is selected
    useEffect(() => {
        if (!selectedSchoolId) {
            setClassSubjects([]);
            setSelectedClassSubjectId("");
            return;
        }

        const fetchClassSubjects = async () => {
            try {
                const data = await queryTable<ClassSubject>("class_subjects", (builder) =>
                    builder
                        .select(`
                            id,
                            classes!inner(id, name, school_id),
                            subject_catalog!inner(id, name, code)
                        `)
                        .eq("classes.school_id", selectedSchoolId)
                        .order("classes(name)")
                );
                
                // Transform the data
                const transformed = (data || []).map(cs => ({
                    id: cs.id,
                    classes: cs.classes,
                    subject_catalog: cs.subject_catalog
                }));
                
                setClassSubjects(transformed);
                
                // Auto-select first if available
                if (transformed.length > 0 && !selectedClassSubjectId) {
                    setSelectedClassSubjectId(transformed[0].id);
                }
            } catch (err) {
                console.error("Class subjects fetch error:", err);
                setClassSubjects([]);
            }
        };

        fetchClassSubjects();
    }, [selectedSchoolId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedSchoolId || !selectedClassSubjectId) {
            setError("Please select a school and class assignment.");
            return;
        }

        if (!formData.name || !formData.email || !formData.phone) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await teacherService.createTeacher({
                p_name: formData.name,
                p_email: formData.email,
                p_phone: formData.phone,
                p_school_id: selectedSchoolId,
                p_class_subject_id: selectedClassSubjectId
            });

            if (!response.success) {
                throw new Error(response.error || "Failed to create teacher");
            }

            setSuccessData(response);
        } catch (err: any) {
            console.error("Teacher creation error:", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProceed = () => {
        navigate("/portal/secondary_school/dashboard");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-slate-600">Loading teacher onboarding...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
                    <p className="text-slate-600 mb-6">Please complete institution setup first.</p>
                    <button
                        onClick={() => navigate("/onboarding")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Go to Onboarding
                    </button>
                </div>
            </div>
        );
    }

    const selectedSchool = schools.find(s => s.id === selectedSchoolId);
    const selectedClassSubject = classSubjects.find(cs => cs.id === selectedClassSubjectId);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-slate-50 to-white">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-3">Teacher Onboarding</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Register a new teacher and assign them to a class-subject mapping.
                        The system will auto-generate a unique Teacher ID upon creation.
                    </p>
                </div>

                {/* Error Toast */}
                {error && (
                    <div className="mb-8 flex items-start bg-red-50 p-4 rounded-2xl border border-red-100 text-red-800 text-sm font-medium animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-500" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success State */}
                {successData && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-8 mb-8 text-center">
                            <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-green-500/20">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-green-800 mb-4">Teacher Onboarding Complete!</h2>
                            
                            <div className="max-w-md mx-auto space-y-4 text-left">
                                <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
                                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Teacher ID (Auto-generated)</p>
                                    <p className="text-xl font-mono font-bold text-slate-900 break-all">{successData.teacher_id}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
                                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">School Linked</p>
                                    <p className="text-lg font-semibold text-slate-900">{selectedSchool?.school_name || "Unknown School"}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
                                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Class Assignment</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {selectedClassSubject?.subject_catalog?.name || "Subject"} 
                                        ({selectedClassSubject?.classes?.name || "Class"})
                                    </p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
                                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Teacher Email</p>
                                    <p className="text-lg font-semibold text-slate-900">{formData.email}</p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={handleProceed}
                                    className="w-full md:w-auto px-12 bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 group"
                                >
                                    Proceed to Dashboard
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form State */}
                {!successData && (
                    <div className="bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 rounded-[3rem] border border-white p-8 md:p-12 transition-all duration-500">
                        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                            {/* School Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">School <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <select
                                        name="schoolId"
                                        value={selectedSchoolId}
                                        onChange={e => setSelectedSchoolId(e.target.value)}
                                        required
                                        disabled={schools.length === 0}
                                        className="w-full bg-slate-50 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:opacity-50"
                                    >
                                        <option value="">Select a School</option>
                                        {schools.map(school => (
                                            <option key={school.id} value={school.id}>
                                                {school.school_name} ({school.school_type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {schools.length === 0 && (
                                    <p className="text-xs text-slate-500">No schools found. Complete institution setup first.</p>
                                )}
                            </div>

                            {/* Class Subject Assignment */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">Class Assignment <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <BookOpen className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <select
                                        name="classSubjectId"
                                        value={selectedClassSubjectId}
                                        onChange={e => setSelectedClassSubjectId(e.target.value)}
                                        required
                                        disabled={classSubjects.length === 0}
                                        className="w-full bg-slate-50 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:opacity-50"
                                    >
                                        <option value="">Select a Class Assignment</option>
                                        {classSubjects.map(cs => (
                                            <option key={cs.id} value={cs.id}>
                                                {cs.subject_catalog?.name} ({cs.classes?.name}) - {cs.subject_catalog?.code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedSchoolId && classSubjects.length === 0 && (
                                    <p className="text-xs text-slate-500">No class-subject mappings found. Initialize subjects for this school first.</p>
                                )}
                            </div>

                            {/* Teacher Details */}
                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Dr. Sarah Johnson"
                                            className="w-full bg-slate-50 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">Email <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="sarah@example.com"
                                            className="w-full bg-slate-50 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Phone <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="+234 800 000 0000"
                                            className="w-full bg-slate-50 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || schools.length === 0 || classSubjects.length === 0}
                                    className="w-full md:w-auto px-12 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Creating Teacher...
                                        </>
                                    ) : (
                                        <>
                                            Create Teacher
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherOnboarding;
