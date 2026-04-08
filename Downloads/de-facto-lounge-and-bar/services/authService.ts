import { Role } from '../types';

const STORAGE_KEY = 'defacto_session';

export interface UserSession {
    role: Role;
    staffId: string;
    staffName: string;
    token: string;
}

export const authService = {
    // Current user state (mimics backend session)
    getSession: (): UserSession | null => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    login: async (role: Role, pin: string): Promise<UserSession> => {
        // Mock authentication
        // CEO PIN: 1234 (Demo only)
        // Staff PIN: Any 4 digits for demo

        await new Promise(resolve => setTimeout(resolve, 500)); // Network delay

        if (role === 'ceo') {
            if (pin === '1234') {
                const session: UserSession = {
                    role: 'ceo',
                    staffId: 'CEO-001',
                    staffName: 'The CEO',
                    token: 'mock_jwt_ceo_' + Date.now()
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
                return session;
            } else {
                throw new Error('Invalid PIN');
            }
        }

        if (role === 'staff') {
            if (pin.length === 4) {
                const session: UserSession = {
                    role: 'staff',
                    staffId: 'STAFF-' + Math.floor(Math.random() * 900 + 100),
                    staffName: 'Staff Member ' + (pin === '5555' ? 'A' : 'B'),
                    token: 'mock_jwt_staff_' + Date.now()
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
                return session;
            } else {
                throw new Error('Invalid Staff PIN (4 digits required)');
            }
        }

        throw new Error('Role not supported');
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload(); // Hard reset state
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem(STORAGE_KEY);
    },

    requireRole: (allowed: Role[]) => {
        const session = authService.getSession();
        if (!session || !allowed.includes(session.role)) {
            throw new Error('UNAUTHORIZED: Access Denied');
        }
        return session;
    }
};
