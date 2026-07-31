import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { authDispatcher } from '../../services/authDispatcher';

// ────────────────────────────────────────────────────────────────────────────
// ResetPassword — Public page the user lands on from the email link.
//
// Supabase delivers the recovery token as a URL hash fragment:
//   /reset-password#access_token=...&type=recovery
//
// The Supabase JS client automatically intercepts the hash and fires
// an onAuthStateChange event with event === 'PASSWORD_RECOVERY'.
// We listen for that event to confirm the session is valid, then
// show the password form.
//
// ❌ Do NOT use searchParams.get('token') — Supabase uses hash fragments.
// ❌ Do NOT wrap this route in AuthGuard — it must be publicly accessible.
// ────────────────────────────────────────────────────────────────────────────

type PageState = 'loading' | 'ready' | 'invalid' | 'success';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Listen for Supabase PASSWORD_RECOVERY event ───────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, _session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Supabase has parsed the hash fragment and established a session.
          // The user is authenticated with a recovery token — show the form.
          setPageState('ready');
        }
      }
    );

    // Fallback: if the event already fired before our listener was registered,
    // check if there's an active session with a recovery type.
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // A session exists — the recovery event may have already fired
        setPageState('ready');
      } else {
        // Give Supabase a moment to process the hash fragment
        const timeout = setTimeout(() => {
          setPageState((current) => current === 'loading' ? 'invalid' : current);
        }, 5000);
        return () => clearTimeout(timeout);
      }
    };

    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ── Handle password update submission ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await authDispatcher.updatePassword(password);
      if (!result.success) {
        throw new Error(result.error?.message || 'Password update failed');
      }
      setPageState('success');
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading State ─────────────────────────────────────────────────────
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-600 mt-4 font-medium">Verifying your reset link...</p>
          <p className="text-slate-400 text-sm mt-1">This should only take a moment.</p>
        </div>
      </div>
    );
  }

  // ── Invalid / Expired Link ────────────────────────────────────────────
  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800 mt-4">Invalid or Expired Link</h2>
          <p className="text-slate-600 mt-2">
            This password reset link is no longer valid. Please request a new one.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              to="/forgot-password"
              className="block w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 text-center"
            >
              Request New Reset Link
            </Link>
            <Link
              to="/login"
              className="block text-sm text-indigo-600 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success State ─────────────────────────────────────────────────────
  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800 mt-4">Password Updated</h2>
          <p className="text-slate-600 mt-2">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Password Form (pageState === 'ready') ─────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full">
        <h1 className="text-2xl font-bold text-center">Create New Password</h1>
        <p className="text-sm text-slate-600 text-center mt-2">Enter your new password below.</p>

        {error && (
          <div className="bg-rose-50 text-rose-800 p-3 rounded-md mt-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full rounded-md border px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 block w-full rounded-md border px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;