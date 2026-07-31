import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useInstitutionStore } from '../store/useInstitutionStore';

export interface UserProfile {
    id: string;
    user_id: string;
    institution_id: string;
    full_name: string;
    role:
    | 'admin'
    | 'teacher'
    | 'student'
    | 'parent'
    | 'examiner'
    | 'ceo'
    | 'super_admin';
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
                const { data: { session } } = await authService.getSession();

                if (!session) {
                    navigate('/login');
                    return;
                }

                // Fetch profile
                const { data: profileData, error: profileError } = await authService.getFullProfile(session.user.id);

                if (profileError || !profileData) {
                    navigate('/login');
                    return;
                }

                const userProfile = profileData as UserProfile;
                setProfile(userProfile);
                setInstitutionId(userProfile.institution_id);

                // Fetch institution type to sync store
                const { data: institutionData } = await authService.getInstitutionType(userProfile.institution_id);

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
