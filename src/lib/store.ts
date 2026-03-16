import { create } from 'zustand';

interface AppState {
    institutionId: string | null;
    schoolId: string | null;
    teacherId: string | null;
    currentUser: any | null;
    selectedClass: string | null;
    selectedExam: string | null;
    setInstitutionId: (id: string | null) => void;
    setSchoolId: (id: string | null) => void;
    setTeacherId: (id: string | null) => void;
    setCurrentUser: (user: any) => void;
    setSelectedClass: (id: string | null) => void;
    setSelectedExam: (id: string | null) => void;
    clearSession: () => void;
}

export const useStore = create<AppState>((set) => ({
    institutionId: localStorage.getItem('institutionId'),
    schoolId: localStorage.getItem('schoolId'),
    teacherId: localStorage.getItem('teacherId'),
    currentUser: null,
    selectedClass: null,
    selectedExam: null,
    setInstitutionId: (id) => {
        if (id) localStorage.setItem('institutionId', id);
        else localStorage.removeItem('institutionId');
        set({ institutionId: id });
    },
    setSchoolId: (id) => {
        if (id) localStorage.setItem('schoolId', id);
        else localStorage.removeItem('schoolId');
        set({ schoolId: id });
    },
    setTeacherId: (id) => {
        if (id) localStorage.setItem('teacherId', id);
        else localStorage.removeItem('teacherId');
        set({ teacherId: id });
    },
    setCurrentUser: (user) => set({ currentUser: user }),
    setSelectedClass: (id) => set({ selectedClass: id }),
    setSelectedExam: (id) => set({ selectedExam: id }),
    clearSession: () => {
        localStorage.removeItem('institutionId');
        localStorage.removeItem('schoolId');
        localStorage.removeItem('teacherId');
        set({ institutionId: null, schoolId: null, teacherId: null, currentUser: null });
    },
}));
