import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useInstitutionStore } from '../../store/useInstitutionStore';
import { ArrowRight } from 'lucide-react';

// Validation helpers
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (pwd: string) => pwd.length >= 8;

const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { setInstitutionType, setInstitutionId } = useInstitutionStore();

    const [form, setForm] = useState({
        institutionName: '',
        institutionType: 'secondary' as const,
        adminFullName: '',
        adminEmail: '',
        password: '',
        confirmPassword: '',
        country: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // client‑side validation
        if (!form.institutionName.trim()) return setError('Institution name is required');
        if (!isValidEmail(form.adminEmail)) return setError('Invalid email address');
        if (!isStrongPassword(form.password)) return setError('Password must be at least 8 characters');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match');
        if (!form.country.trim()) return setError('Country is required');

        setLoading(true);
        try {
            // 1️⃣ create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.adminEmail,
                password: form.password,
                options: {
                    data: {
                        full_name: form.adminFullName,
                        institution_type: form.institutionType,
                    },
                },
            });
            if (authError) throw authError;
            const userId = authData?.user?.id;
            if (!userId) throw new Error('Failed to retrieve newly created user id');

            // 2️⃣ call RPC that creates institution, admin profile and audit log atomically
            const { data: rpcData, error: rpcError } = await supabase.rpc('create_institution_admin_account', {
                p_user_id: userId,
                p_institution_name: form.institutionName,
                p_institution_type: form.institutionType,
                p_country: form.country,
                p_admin_full_name: form.adminFullName,
            });
            if (rpcError) throw rpcError;

            const institutionId = (rpcData as any).institution_id as string;
            setInstitutionId(institutionId);
            setInstitutionType(form.institutionType);

            // 3️⃣ redirect to setup wizard
            navigate('/dashboard/setup');
        } catch (err: any) {
            // best‑effort cleanup of auth user if something went wrong
            const uid = (err?.details?.user?.id as string) ?? null;
            if (uid) await supabase.auth.admin.deleteUser(uid);
            setError(err?.message ?? 'Unexpected error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">Create your SEFAES account</h1>
                {error && (
                    <div className="mb-4 rounded-md bg-rose-50 p-3 text-rose-800 border border-rose-200">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Institution name & type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Institution Name</label>
                            <input
                                type="text"
                                value={form.institutionName}
                                onChange={handleChange('institutionName')}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Institution Type</label>
                            <select
                                value={form.institutionType}
                                onChange={handleChange('institutionType')}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="secondary">Secondary School</option>
                                <option value="university">University</option>
                                <option value="polytechnic">Polytechnic</option>
                                <option value="corporate">Corporate Training</option>
                            </select>
                        </div>
                    </div>

                    {/* Admin name & email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Admin Full Name</label>
                            <input
                                type="text"
                                value={form.adminFullName}
                                onChange={handleChange('adminFullName')}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Admin Email</label>
                            <input
                                type="email"
                                value={form.adminEmail}
                                onChange={handleChange('adminEmail')}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Password & confirm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={handleChange('password')}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                            <input
                                type="password"
                                value={form.confirmPassword}
                                onChange={handleChange('confirmPassword')}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Country</label>
                        <input
                            type="text"
                            value={form.country}
                            onChange={handleChange('country')}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating…' : 'Create Account'}
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
