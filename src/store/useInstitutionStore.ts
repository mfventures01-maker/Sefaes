import { create } from 'zustand';

interface InstitutionState {
    institutionType: 'secondary' | 'university' | 'polytechnic' | 'corporate' | null;
    institutionId: string | null;
    setInstitutionType: (type: 'secondary' | 'university' | 'polytechnic' | 'corporate') => void;
    setInstitutionId: (id: string) => void;
    clearInstitution: () => void;
}

export const useInstitutionStore = create<InstitutionState>((set) => ({
    institutionType: (localStorage.getItem('institutionType') as InstitutionState['institutionType']) || null,
    institutionId: localStorage.getItem('institutionId') || null,
    setInstitutionType: (type) => {
        localStorage.setItem('institutionType', type);
        set({ institutionType: type });
    },
    setInstitutionId: (id) => {
        localStorage.setItem('institutionId', id);
        set({ institutionId: id });
    },
    clearInstitution: () => {
        localStorage.removeItem('institutionType');
        localStorage.removeItem('institutionId');
        set({ institutionType: null, institutionId: null });
    },
}));
