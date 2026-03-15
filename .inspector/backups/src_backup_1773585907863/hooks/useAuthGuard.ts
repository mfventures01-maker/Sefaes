import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useInstitutionStore } from '../store/useInstitutionStore';

export interface UserProfile {
    id: string;
    user_id: string;
    institution_id: string;
    full_name: string;
    role: 'principal_admin' | 'teacher' | 'student' | 'examiner';
    created_at: string;
}

export const useAuthGuard = () => {
    const navigate = useNavigate();
    const { setInstitutionId, setInstitutionType } = useInstitutionStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    navigate('/login');
                    return;
                }

                // Fetch profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                if (profileError || !profileData) {
                    // Profile might not exist yet if signup was interrupted
                    // or if it's a social login without profile creation
                    navigate('/login');
                    return;
                }

                const userProfile = profileData as UserProfile;
                setProfile(userProfile);
                setInstitutionId(userProfile.institution_id);

                // Fetch institution type to sync store
                const { data: institutionData } = await supabase
                    .from('institutions')
                    .select('type')
                    .eq('id', userProfile.institution_id)
                    .single();

                if (institutionData) {
                    setInstitutionType(institutionData.type as any);
                }

                setLoading(false);
            } catch (err) {
                console.error('Auth guard error:', err);
                navigate('/login');
            }
        };

        checkAuth();
    }, [navigate, setInstitutionId, setInstitutionType]);

    return { profile, loading };
};
