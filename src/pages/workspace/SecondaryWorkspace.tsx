import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useInstitutionStore } from '../../store/useInstitutionStore';

export const SecondaryWorkspace: React.FC = () => {
    const navigate = useNavigate();
    const { setInstitutionId, setInstitutionType } = useInstitutionStore();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const executeWorkspaceGuard = async () => {
            try {
                // Fetch authenticated user properly per requirements
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError || !user) {
                    navigate('/login');
                    return;
                }

                // Fetch profile to inspect institution_id
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('institution_id, role')
                    .eq('user_id', user.id)
                    .single();

                if (profileError || !profile) {
                    throw new Error("Profile not found");
                }

                // Workspace Guard Logic
                if (!profile.institution_id) {
                    // Force redirect to onboarding if missing
                    navigate('/onboarding/create-institution');
                } else {
                    // Update state & Go to secondary dashboard
                    setInstitutionId(profile.institution_id);
                    setInstitutionType('secondary_school');
                    navigate('/portal/secondary_school/dashboard');
                }
            } catch (err) {
                console.error("WORKSPACE GUARD FAILED", err);
                navigate('/auth/recover-account');
            } finally {
                setVerifying(false);
            }
        };

        executeWorkspaceGuard();
    }, [navigate, setInstitutionId, setInstitutionType]);

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Initializing Secondary Workspace...</p>
                </div>
            </div>
        );
    }

    return null; // Should redirect before rendering this
};

export default SecondaryWorkspace;
