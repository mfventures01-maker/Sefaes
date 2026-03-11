import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowRight } from 'lucide-react';

// Validation helpers
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (pwd: string) => pwd.length >= 8;

const SignupPage: React.FC = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (!form.fullName.trim()) return setError('Full name is required');
        if (!isValidEmail(form.email)) return setError('Invalid email address');
        if (!isStrongPassword(form.password)) return setError('Password must be at least 8 characters');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match');

        setLoading(true);
        try {
            // STEP 1: Create Supabase auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.fullName,
                    },
                },
            });

            if (authError) throw authError;

            const authUser = authData?.user;
            console.log("AUTH USER", authData);

            if (!authUser) throw new Error('Failed to retrieve newly created user');

            // STEP 2 — Immediately establish a login session
            const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password
            });

            if (loginError) throw loginError;
            console.log("SESSION", sessionData);

            // Redirect user to workspace selection portal
            // The workspace guard will catch NULL institution_ids and guide them to onboarding
            navigate(`/portal`);

        } catch (err: any) {
            console.error("SIGNUP PIPELINE FAILURE:", err);
            setError(err?.message ?? 'Signup failed. Please try again.');
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
                    {/* Admin name & email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                type="text"
                                value={form.fullName}
                                onChange={handleChange('fullName')}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={handleChange('email')}
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
