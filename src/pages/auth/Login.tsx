import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authDispatcher } from '../../services/authDispatcher';
import { authService } from '../../services/authService';
import { useStore } from '../../lib/store';
import { Loader2, Lock, Mail, UserCircle } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [anonLoading, setAnonLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { setCurrentUser, setSchoolId } = useStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // STEP 1: Dispatch AUTH.SIGN_IN command via gateway
            const signInResult = await authDispatcher.signIn(email, password);

            if (!signInResult.success) {
                throw new Error(signInResult.error?.message || 'Login failed');
            }

            const userData = signInResult.data as any;
            if (userData?.userId) {
                setCurrentUser({ id: userData.userId, email: userData.email, role: userData.role } as any);

                // FIX-07: Anchor school context from JWT-verified response.
                // The SIGN_IN response now includes schoolId and institutionId
                // extracted from app_metadata by the server — not a client-side lookup.
                // This is the SINGLE SOURCE OF TRUTH for tenant context.
                if (userData.schoolId) {
                    setSchoolId(userData.schoolId);
                } else {
                    // Fallback: If school not in JWT yet (e.g. new institution admin
                    // before school setup), fetch from DB as secondary resolution.
                    const { data: schoolData } = await authService.getSchoolByEmail(email);
                    if (schoolData) {
                        setSchoolId(schoolData.id);
                    }
                }

                if (userData.institutionId) {
                    useStore.getState().setInstitutionId(userData.institutionId);
                }

                // Redirect to institution selector
                navigate('/portal');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleAnonymousLogin = async () => {
        setAnonLoading(true);
        setError(null);

        try {
            const result = await authDispatcher.signInAnonymously();

            if (!result.success) {
                throw new Error(result.error?.message || 'Anonymous login failed');
            }

            const userData = result.data as any;
            if (userData?.userId) {
                setCurrentUser({ id: userData.userId, email: null, role: 'authenticated' } as any);
                navigate('/portal');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to sign in as guest');
        } finally {
            setAnonLoading(false);
        }
    };

    const isAnyLoading = loading || anonLoading;

    return (
        <div className="flex min-h-[100dvh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-5 filter grayscale blur-md"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
                    <span className="font-extrabold text-3xl">S</span>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-slate-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Or <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">start your 14-day free trial</Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-10 px-6 shadow-2xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700">Email address</label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 block w-full rounded-xl border-slate-300 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                                    placeholder="admin@school.edu.ng"
                                    disabled={isAnyLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700">Password</label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 block w-full rounded-xl border-slate-300 py-3 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                                    placeholder="••••••••"
                                    disabled={isAnyLoading}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isAnyLoading}
                                className="flex w-full justify-center items-center rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in'}
                            </button>
                        </div>
                    </form>

                    {/* ── Divider ─────────────────────────────────────────── */}
                    <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-4 text-slate-500 font-medium">or</span>
                        </div>
                    </div>

                    {/* ── Guest / Anonymous Login ─────────────────────────── */}
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={handleAnonymousLogin}
                            disabled={isAnyLoading}
                            className="flex w-full justify-center items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100 hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {anonLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <UserCircle className="w-5 h-5" />
                                    Continue as Guest
                                </>
                            )}
                        </button>
                        <p className="mt-2 text-center text-xs text-slate-400">
                            No account needed — explore the portal instantly
                        </p>
                    </div>

                    <div className="mt-6">
                        <Link to="/" className="flex justify-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                            ← Back to public website
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
