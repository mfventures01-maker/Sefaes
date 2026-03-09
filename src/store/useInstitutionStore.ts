import { create } from 'zustand';

interface InstitutionState {
    institutionType: 'secondary_school' | 'university' | 'corporate' | null;
    institutionId: string | null;
    schoolId: string | null; // For legacy compatibility with existing components
    setInstitutionType: (type: 'secondary_school' | 'university' | 'corporate') => void;
    setInstitutionId: (id: string) => void;
    setSchoolId: (id: string) => void;
    clearInstitution: () => void;
}

export const useInstitutionStore = create<InstitutionState>((set) => ({
    institutionType: (localStorage.getItem('institutionType') as InstitutionState['institutionType']) || null,
    institutionId: localStorage.getItem('institutionId') || null,
    schoolId: localStorage.getItem('schoolId') || localStorage.getItem('institutionId') || null,
    setInstitutionType: (type) => {
        localStorage.setItem('institutionType', type);
        set({ institutionType: type });
    },
    setInstitutionId: (id) => {
        localStorage.setItem('institutionId', id);
        localStorage.setItem('schoolId', id); // Keep in sync
        set({ institutionId: id, schoolId: id });
    },
    setSchoolId: (id) => {
        localStorage.setItem('schoolId', id);
        localStorage.setItem('institutionId', id); // Keep in sync
        set({ schoolId: id, institutionId: id });
    },
    clearInstitution: () => {
        localStorage.removeItem('institutionType');
        localStorage.removeItem('institutionId');
        localStorage.removeItem('schoolId');
        set({ institutionType: null, institutionId: null, schoolId: null });
    },
}));
