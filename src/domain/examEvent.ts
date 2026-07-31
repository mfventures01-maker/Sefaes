import { SystemState } from './stateMachine';

export interface ExamQuestion {
  id: string;
  questionText: string;
  options: string[];
}

export interface StudentSubmission {
  studentId: string;
  answers: Record<string, string>; // questionId -> selectedOption
  submittedAt: string;
}

export interface ExamEvent {
  id: string;
  school_id: string;
  teacher_id: string;
  student_ids: string[];
  state: SystemState;
  title: string;
  questions: ExamQuestion[];
  submissions: StudentSubmission[];
  createdAt: string;
  readyAt?: string;
  startedAt?: string;
  submittedAt?: string;
  completedAt?: string;
}
