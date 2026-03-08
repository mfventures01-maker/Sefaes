import { create } from 'zustand';

interface AppState {
    institutionId: string | null;
    schoolId: string | null;
    setInstitutionId: (id: string) => void;
    setSchoolId: (id: string) => void;
    clearSession: () => void;
}

export const useStore = create<AppState>((set) => ({
    institutionId: localStorage.getItem('institutionId'),
    schoolId: localStorage.getItem('schoolId'),
    setInstitutionId: (id) => {
        localStorage.setItem('institutionId', id);
        set({ institutionId: id });
    },
    setSchoolId: (id) => {
        localStorage.setItem('schoolId', id);
        set({ schoolId: id });
    },
    clearSession: () => {
        localStorage.removeItem('institutionId');
        localStorage.removeItem('schoolId');
        set({ institutionId: null, schoolId: null });
    },
}));
