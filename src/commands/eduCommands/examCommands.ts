export const ExamCommandTypes = {
    EXAM_CREATE: 'EXAM.CREATE',
    EXAM_READ: 'EXAM.READ',
    EXAM_READ_WITH_SCHEMES: 'EXAM.READ_WITH_SCHEMES',
    EXAM_TRANSITION_STATE: 'EXAM.TRANSITION_STATE'
} as const;

export type ExamCommandType = typeof ExamCommandTypes[keyof typeof ExamCommandTypes];
