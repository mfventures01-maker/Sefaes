import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authDispatcher } from '../../services/authDispatcher';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Self-healing environment-aware redirect URL resolution
      // Priority: VITE_APP_BASE_URL env var > current browser origin (localhost vs Docker IP)
      const baseUrl = (import.meta.env.VITE_APP_BASE_URL || window.location.origin).replace(/\/$/, '');
      const redirectTo = `${baseUrl}/reset-password`;

      const result = await authDispatcher.resetPassword(email, redirectTo);
      if (!result.success) {
        throw new Error(result.error?.message || 'Password reset failed');
      }
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <p className="text-sm text-slate-600 text-center mt-2">
          Enter your email to receive a reset link.
        </p>

        {error && (
          <div className="bg-rose-50 text-rose-800 p-3 rounded-md mt-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-md mt-4">
            ✅ Email sent. Check your inbox.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              placeholder="admin@school.edu.ng"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-indigo-600 hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;