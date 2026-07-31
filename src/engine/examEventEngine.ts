import { UserRole } from '../domain/roles';
import { resolveAccess } from './resolveAccess';
import { validateStateTransition } from '../domain/stateMachine';
import { useSystemStore } from '../state/systemState';
import { ExamEvent, ExamQuestion } from '../domain/examEvent';
import { Action } from '../domain/permissions';
import { onboardingService } from '../services/onboardingService';
import { gradingService } from '../services/gradingService';
import { enterTransition, exitTransition } from './mutationPolicy';

/**
 * Exam Event Engine
 * 
 * All actions mutating or accessing the exam event kernel MUST go through this engine.
 * Ensures role enforcement and state machine transition integrity.
 */

export const examEventEngine = {
  /**
   * Initializes the system and moves state from setup to ready.
   * Admin only.
   */
  initializeSystem(role: UserRole, schoolName: string, studentIds: string[]) {
    // 1. Validate role
    resolveAccess(role, 'SETUP_INSTITUTION');

    // 2. Validate state transition
    const { systemState, initializeInstitution, setSystemState } = useSystemStore.getState();
    validateStateTransition(systemState, 'ready');

    // 3. Apply state change
    initializeInstitution(schoolName, studentIds);
    setSystemState('ready');

    return useSystemStore.getState().systemState;
  },

  /**
   * Creates an exam event in the 'ready' state.
   * Teacher only.
   */
  createExamEvent(
    role: UserRole,
    schoolId: string,
    teacherId: string,
    title: string,
    questions: ExamQuestion[]
  ): 'ready' {
    // 1. Validate role
    resolveAccess(role, 'CREATE_EXAM');

    // 2. Validate current state is 'ready'
    const { systemState, setActiveExamEvent } = useSystemStore.getState();
    if (systemState !== 'ready') {
      throw new Error('INVALID_STATE_TRANSITION');
    }

    // 3. Create the event object
    const newEvent: ExamEvent = {
      id: crypto.randomUUID(),
      school_id: schoolId,
      teacher_id: teacherId,
      student_ids: [],
      state: 'ready',
      title,
      questions,
      submissions: [],
      createdAt: new Date().toISOString()
    };

    // 4. Update store
    setActiveExamEvent(newEvent);

    return 'ready';
  },

  /**
   * Publishes the exam event, making it active for students.
   * Transitions ready -> exam_active.
   * Teacher only.
   */
  publishExamEvent(role: UserRole, examId: string) {
    // 1. Validate role
    resolveAccess(role, 'PUBLISH_EXAM');

    // 2. Validate active exam
    const { systemState, activeExamEvent, setSystemState, setActiveExamEvent } = useSystemStore.getState();
    if (!activeExamEvent || activeExamEvent.id !== examId) {
      throw new Error('EXAM_NOT_FOUND');
    }

    // 3. Validate state transition (ready -> exam_active)
    validateStateTransition(systemState, 'exam_active');

    // 4. Update state
    setSystemState('exam_active');
    setActiveExamEvent({
      ...activeExamEvent,
      state: 'exam_active',
      startedAt: new Date().toISOString()
    });

    return useSystemStore.getState().systemState;
  },

  /**
   * Validates if a student can join the active exam event.
   * Student only.
   */
  joinExamEvent(role: UserRole, examId: string, studentId: string) {
    // 1. Validate role
    resolveAccess(role, 'JOIN_EXAM');

    // 2. Validate state is 'exam_active'
    const { systemState, activeExamEvent, studentsEnrolled } = useSystemStore.getState();
    if (systemState !== 'exam_active') {
      throw new Error('INVALID_STATE_TRANSITION');
    }

    // 3. Validate exam existence
    if (!activeExamEvent || activeExamEvent.id !== examId) {
      throw new Error('EXAM_NOT_FOUND');
    }

    // 4. Validate student enrollment
    if (!studentsEnrolled.includes(studentId)) {
      throw new Error('STUDENT_NOT_ENROLLED');
    }

    return useSystemStore.getState().systemState;
  },

  /**
   * Submits answers for a student, transitions system from exam_active to grading.
   * Student only.
   */
  submitExamEvent(
    role: UserRole,
    examId: string,
    studentId: string,
    answers: Record<string, string>
  ) {
    // 1. Validate role
    resolveAccess(role, 'SUBMIT_EXAM');

    // 2. Validate active exam
    const { systemState, activeExamEvent, registerSubmission, setSystemState, setActiveExamEvent } = useSystemStore.getState();
    if (!activeExamEvent || activeExamEvent.id !== examId) {
      throw new Error('EXAM_NOT_FOUND');
    }

    // 3. Validate state transition (exam_active -> grading)
    validateStateTransition(systemState, 'grading');

    // 4. Register submission
    const submission = {
      studentId,
      answers,
      submittedAt: new Date().toISOString()
    };
    registerSubmission(submission);

    // 5. Update state to grading
    setSystemState('grading');
    if (useSystemStore.getState().activeExamEvent) {
      const currentEvent = useSystemStore.getState().activeExamEvent!;
      setActiveExamEvent({
        ...currentEvent,
        state: 'grading',
        submittedAt: new Date().toISOString()
      });
    }

    return useSystemStore.getState().systemState;
  },

  /**
   * Transitions system state from grading to completed.
   * Teacher only (canPerform uses 'PUBLISH_EXAM' action for teacher authorization).
   */
  completeExamEvent(role: UserRole, examId: string) {
    // 1. Validate role
    resolveAccess(role, 'PUBLISH_EXAM');

    // 2. Validate active exam
    const { systemState, activeExamEvent, setSystemState, setActiveExamEvent } = useSystemStore.getState();
    if (!activeExamEvent || activeExamEvent.id !== examId) {
      throw new Error('EXAM_NOT_FOUND');
    }

    // 3. Validate state transition (grading -> completed)
    validateStateTransition(systemState, 'completed');

    // 4. Update state to completed
    setSystemState('completed');
    setActiveExamEvent({
      ...activeExamEvent,
      state: 'completed',
      completedAt: new Date().toISOString()
    });

    return useSystemStore.getState().systemState;
  },

  /**
   * Unified transition hard gate for FSM Lockdown.
   * All mutations MUST flow through this method.
   */
  async transition(event: string, payload: any): Promise<any> {
    const { systemState } = useSystemStore.getState();

    let action: Action;
    let requiredState: 'setup' | 'ready' | 'exam_active' | 'grading' | 'completed' | null = null;

    switch (event) {
      case 'CREATE_CLASS':
      case 'DELETE_CLASS':
      case 'CREATE_SUBJECT':
      case 'ASSIGN_SUBJECT_TO_CLASS':
      case 'DELETE_SUBJECT_ASSIGNMENT':
      case 'CREATE_TEACHER':
        action = 'SETUP_INSTITUTION';
        if (systemState !== 'setup' && systemState !== 'ready') {
          throw new Error('INVALID_STATE_TRANSITION');
        }
        break;

      case 'CREATE_EXAM':
        action = 'CREATE_EXAM';
        requiredState = 'ready';
        break;

      case 'PUBLISH_EXAM':
        action = 'PUBLISH_EXAM';
        requiredState = 'ready';
        break;

      case 'JOIN_EXAM':
        action = 'JOIN_EXAM';
        requiredState = 'exam_active';
        break;

      case 'CREATE_ANSWER_SCRIPT':
      case 'SUBMIT_EXAM':
        action = 'SUBMIT_EXAM';
        requiredState = 'exam_active';
        break;

      case 'START_AI_GRADING':
        action = 'PUBLISH_EXAM';
        requiredState = 'grading';
        break;

      case 'COMPLETE_EXAM':
        action = 'PUBLISH_EXAM';
        requiredState = 'grading';
        break;

      default:
        throw new Error(`UNKNOWN_EVENT: ${event}`);
    }

    // 1. Resolve Access
    resolveAccess(payload.role, action);

    // 2. Validate FSM State Transition/Requirement
    if (requiredState && systemState !== requiredState) {
      if (event === 'PUBLISH_EXAM') {
        validateStateTransition(systemState, 'exam_active');
      } else if (event === 'SUBMIT_EXAM' || event === 'CREATE_ANSWER_SCRIPT') {
        validateStateTransition(systemState, 'grading');
      } else if (event === 'COMPLETE_EXAM') {
        validateStateTransition(systemState, 'completed');
      } else {
        throw new Error('INVALID_STATE_TRANSITION');
      }
    }

    // 3. Execute Mutation/Write ONLY here
    enterTransition();
    try {
      switch (event) {
        case 'CREATE_CLASS':
          return await onboardingService.createClass(payload.data);
        case 'DELETE_CLASS':
          return await onboardingService.deleteClass(payload.id);
        case 'CREATE_SUBJECT':
          return await onboardingService.createSubjectInCatalog(payload.name);
        case 'ASSIGN_SUBJECT_TO_CLASS':
          return await onboardingService.assignSubjectToClass(payload.classId, payload.subjectId, payload.schoolId);
        case 'DELETE_SUBJECT_ASSIGNMENT':
          return await onboardingService.deleteSubjectAssignment(payload.id);
        case 'CREATE_TEACHER':
          return await onboardingService.createTeacher(payload.data);
        case 'CREATE_EXAM':
          return await gradingService.createExam(payload.data);
        case 'PUBLISH_EXAM':
          return this.publishExamEvent(payload.role, payload.examId);
        case 'JOIN_EXAM':
          return this.joinExamEvent(payload.role, payload.examId, payload.studentId);
        case 'CREATE_ANSWER_SCRIPT':
          return await gradingService.createAnswerScript(payload.data);
        case 'SUBMIT_EXAM':
          return this.submitExamEvent(payload.role, payload.examId, payload.studentId, payload.answers);
        case 'START_AI_GRADING':
          return await gradingService.startAIGrading(payload.examId);
        case 'COMPLETE_EXAM':
          return this.completeExamEvent(payload.role, payload.examId);
      }
    } finally {
      exitTransition();
    }
  }
};
