import { create } from 'zustand';

interface AppState {
    institutionId: string | null;
    schoolId: string | null;
    currentUser: any | null;
    selectedClass: string | null;
    selectedExam: string | null;
    setInstitutionId: (id: string) => void;
    setSchoolId: (id: string) => void;
    setCurrentUser: (user: any) => void;
    setSelectedClass: (id: string) => void;
    setSelectedExam: (id: string) => void;
    clearSession: () => void;
}

export const useStore = create<AppState>((set) => ({
    institutionId: localStorage.getItem('institutionId'),
    schoolId: localStorage.getItem('schoolId'),
    currentUser: null,
    selectedClass: null,
    selectedExam: null,
    setInstitutionId: (id) => {
        localStorage.setItem('institutionId', id);
        localStorage.setItem('schoolId', id);
        set({ institutionId: id, schoolId: id });
    },
    setSchoolId: (id) => {
        localStorage.setItem('schoolId', id);
        localStorage.setItem('institutionId', id);
        set({ schoolId: id, institutionId: id });
    },
    setCurrentUser: (user) => set({ currentUser: user }),
    setSelectedClass: (id) => set({ selectedClass: id }),
    setSelectedExam: (id) => set({ selectedExam: id }),
    clearSession: () => {
        localStorage.removeItem('institutionId');
        localStorage.removeItem('schoolId');
        set({ institutionId: null, schoolId: null, currentUser: null });
    },
}));
