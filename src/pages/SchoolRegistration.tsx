import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Building2, User, MapPin, Mail, Phone, Loader2, ArrowRight } from 'lucide-react';
import { onboardingService } from '../services/onboardingService';

const SchoolRegistration: React.FC = () => {
    const navigate = useNavigate();
    const { setSchoolId } = useStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        school_name: '',
        address: '',
        principal_name: '',
        email: '',
        phone: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await onboardingService.createSchool({
                school_name: formData.school_name,
                school_type: 'Secondary',
                address: formData.address,
                email: formData.email,
                phone: formData.phone,
                principal_name: formData.principal_name,
                institution_id: '' // No institution selected yet in this legacy flow
            });

            if (data && (data as any).id) {
                setSchoolId((data as any).id);
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('Registration Error:', err);
            setError(err.message || 'Failed to register school. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <span className="font-bold text-3xl">S</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Register Your School
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Setup SEFAES for your institution
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="school_name" className="block text-sm font-semibold text-slate-700">
                                School Name
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="school_name"
                                    name="school_name"
                                    type="text"
                                    required
                                    value={formData.school_name}
                                    onChange={handleChange}
                                    className="pl-10 block w-full rounded-xl border-slate-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-3 border"
                                    placeholder="e.g. Example Secondary School"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-semibold text-slate-700">
                                Address
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="pl-10 block w-full rounded-xl border-slate-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-3 border"
                                    placeholder="123 Education Lane"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="principal_name" className="block text-sm font-semibold text-slate-700">
                                Principal's Name
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="principal_name"
                                    name="principal_name"
                                    type="text"
                                    required
                                    value={formData.principal_name}
                                    onChange={handleChange}
                                    className="pl-10 block w-full rounded-xl border-slate-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-3 border"
                                    placeholder="Mr. John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                                Email Address
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10 block w-full rounded-xl border-slate-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-3 border"
                                    placeholder="school@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                                Phone Number
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="pl-10 block w-full rounded-xl border-slate-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-3 border"
                                    placeholder="+234 XXX XXXX"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed items-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        Get Started
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Already have a school registered? Skip to Dashboard
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchoolRegistration;
