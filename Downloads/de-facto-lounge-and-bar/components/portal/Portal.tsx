import React, { useState, useEffect } from 'react';
import { authService, UserSession } from '../../services/authService';
import { getCurrentActorRole, setTestRole } from '../../services/auditService';
import EliteDashboard from '../../components/dashboard/EliteDashboard';
// Placeholder for StaffDashboard - currently just ordering flow or minimal view
// We will create a StaffDashboard component later or reuse existing components.

const Portal: React.FC = () => {
    const [session, setSession] = useState<UserSession | null>(null);
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [view, setView] = useState<'login' | 'dashboard'>('login');

    useEffect(() => {
        const current = authService.getSession();
        if (current) {
            setSession(current);
            setView('dashboard');
            setTestRole(current.role); // Sync audit service
        }
    }, []);

    const handleLogin = async (role: 'staff' | 'ceo') => {
        setLoading(true);
        setError('');
        try {
            const sess = await authService.login(role, pin);
            setSession(sess);
            setView('dashboard');
            setTestRole(sess.role);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
            setPin('');
        }
    };

    const handleLogout = () => {
        authService.logout();
        setSession(null);
        setView('login');
        setTestRole(null);
    };

    if (view === 'login') {
        return (
            <div className="min-h-screen bg-defacto-black flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-black/50 border border-defacto-gold/20 p-8 rounded-2xl backdrop-blur-sm">
                    <h1 className="text-3xl font-serif text-defacto-gold text-center mb-2">De Facto Portal</h1>
                    <p className="text-defacto-cream/60 text-center mb-8 text-sm uppercase tracking-widest">Authorized Access Only</p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-defacto-gold/60 mb-2">Access PIN</label>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full bg-white/5 border border-defacto-gold/20 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-defacto-gold"
                                maxLength={4}
                                placeholder="••••"
                            />
                        </div>

                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleLogin('staff')}
                                disabled={loading || pin.length !== 4}
                                className="bg-defacto-green text-white py-3 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-defacto-green/80 disabled:opacity-50 transition-all"
                            >
                                Staff Login
                            </button>
                            <button
                                onClick={() => handleLogin('ceo')}
                                disabled={loading || pin.length !== 4}
                                className="bg-defacto-gold text-black py-3 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-defacto-gold/80 disabled:opacity-50 transition-all"
                            >
                                CEO Login
                            </button>
                        </div>

                        <p className="text-xs text-center text-white/30">
                            Demo Mode Check: {import.meta.env.DEV ? 'ACTIVE' : 'INACTIVE'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-defacto-black text-white">
            {/* Portal Header */}
            <div className="bg-defacto-green/20 border-b border-defacto-gold/10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-defacto-gold flex items-center justify-center text-black font-bold">
                        {session.role === 'ceo' ? 'CEO' : 'ST'}
                    </div>
                    <div>
                        <h2 className="font-bold text-defacto-gold">{session.staffName}</h2>
                        <span className="text-xs uppercase tracking-widest opacity-60">{session.role} Portal</span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/10"
                >
                    LOGOUT
                </button>
            </div>

            {/* Content Switcher */}
            {session.role === 'ceo' ? (
                <EliteDashboard />
            ) : (
                <div className="p-8 text-center text-white/60">
                    <h2 className="text-2xl font-serif text-defacto-gold mb-4">Staff Dashboard</h2>
                    <p>Welcome, {session.staffName}.</p>
                    <p className="mt-2 text-sm">Please navigate to "QR" to place orders, or use the mobile ordering flow.</p>
                    <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 max-w-md mx-auto">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Your Actions</h3>
                        <p className="text-xs">You cannot verify payments. Please ask a Manager or CEO to verify TRANSFER/POS payments in the Dashboard.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Portal;
