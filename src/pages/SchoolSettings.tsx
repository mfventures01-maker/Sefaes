import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Building, Phone, Mail, User, MapPin, Loader2, Save, CheckCircle } from 'lucide-react';
import { onboardingService } from '../services/onboardingService';

const SchoolSettings: React.FC = () => {
    const { schoolId } = useStore();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        school_name: '',
        address: '',
        principal_name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (schoolId) {
            fetchSchoolData();
        } else {
            setFetching(false);
        }
    }, [schoolId]);

    const fetchSchoolData = async () => {
        try {
            const { data, error } = await supabase
                .from('schools')
                .select('*')
                .eq('id', schoolId)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    school_name: data.school_name || '',
                    address: data.address || '',
                    principal_name: data.principal_name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                });
            }
        } catch (err) {
            console.error('Error fetching school profile', err);
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId) return;

        setLoading(true);
        setSuccess(false);
        setError(null);

        try {
            await onboardingService.updateSchoolSettings(schoolId, formData as any);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error updating school profile.');
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

    if (fetching) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">School Settings</h2>
                <p className="text-slate-500">Manage your institution's core profile configuration.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-200 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            School profile updated successfully.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">School Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    name="school_name"
                                    type="text"
                                    required
                                    value={formData.school_name}
                                    onChange={handleChange}
                                    className="pl-10 w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">School Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10 w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Principal Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    name="principal_name"
                                    type="text"
                                    required
                                    value={formData.principal_name}
                                    onChange={handleChange}
                                    className="pl-10 w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="pl-10 w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    name="address"
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="pl-10 w-full rounded-xl border-slate-300 border p-3 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Update Profile</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SchoolSettings;
