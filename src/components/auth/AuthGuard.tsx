import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useInstitutionStore } from '../../store/useInstitutionStore';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { setInstitutionId, setInstitutionType } = useInstitutionStore();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            const { data: { session } } = await authService.getSession();

            if (!session) {
                navigate('/login');
                return;
            }

            // Dashboard Verification
            const { data, error } = await authService.getProfileWithInstitution(session.user.id);

            if (error || !data || !data.institutions) {
                console.error("DASHBOARD VERIFICATION FAILED", error);
                navigate('/auth/recover-account');
                return;
            }

            // Success: Update store
            const inst = data.institutions as any;
            setInstitutionId(data.institution_id);
            setInstitutionType(inst.type);
            setVerifying(false);
        };

        verifySession();
    }, [navigate, setInstitutionId, setInstitutionType]);

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Verifying institution access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
