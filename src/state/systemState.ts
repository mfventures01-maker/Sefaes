import { create } from 'zustand';
import { SystemState } from '../domain/stateMachine';
import { ExamEvent, StudentSubmission } from '../domain/examEvent';
import { UserRole } from '../domain/roles';

interface SystemStore {
  systemState: SystemState;
  activeExamEvent: ExamEvent | null;
  institutionName: string | null;
  studentsEnrolled: string[];
  currentRole: UserRole;
  currentStudentId: string | null;
  
  // Setters/mutations called by the engine
  setSystemState: (state: SystemState) => void;
  setActiveExamEvent: (event: ExamEvent | null) => void;
  initializeInstitution: (name: string, studentIds: string[]) => void;
  registerSubmission: (submission: StudentSubmission) => void;
  
  // Simulation utilities for testing/demo
  setCurrentRole: (role: UserRole) => void;
  setCurrentStudentId: (id: string | null) => void;
  reset: () => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
  systemState: 'setup',
  activeExamEvent: null,
  institutionName: null,
  studentsEnrolled: [],
  currentRole: 'admin',
  currentStudentId: null,

  setSystemState: (state) => set({ systemState: state }),
  
  setActiveExamEvent: (event) => set({ activeExamEvent: event }),
  
  initializeInstitution: (name, studentIds) => set({
    institutionName: name,
    studentsEnrolled: studentIds,
    systemState: 'setup' // Set to setup, ready to transition to ready
  }),
  
  registerSubmission: (submission) => set((state) => {
    if (!state.activeExamEvent) return {};
    
    // Check if student already submitted
    const filteredSubmissions = state.activeExamEvent.submissions.filter(
      (sub) => sub.studentId !== submission.studentId
    );
    
    const updatedEvent: ExamEvent = {
      ...state.activeExamEvent,
      submissions: [...filteredSubmissions, submission],
      student_ids: Array.from(new Set([...state.activeExamEvent.student_ids, submission.studentId]))
    };
    
    return { activeExamEvent: updatedEvent };
  }),

  setCurrentRole: (role) => set({ currentRole: role }),
  
  setCurrentStudentId: (id) => set({ currentStudentId: id }),
  
  reset: () => set({
    systemState: 'setup',
    activeExamEvent: null,
    institutionName: null,
    studentsEnrolled: [],
    currentRole: 'admin',
    currentStudentId: null,
  })
}));
