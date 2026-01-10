export interface CustomRules {
  strictGrammar: boolean;
  penalizeRepetition: boolean;
  repetitionSeverity?: 'Low' | 'Medium' | 'High';
  requireStructure: boolean;
  structureComponents?: string;
  toneExpectation?: 'Academic' | 'Neutral' | 'Creative';
  additionalInstructions: string;
}

export interface MarkingScheme {
  id: string;
  subject: string;
  question: string;
  referenceAnswer: string;
  keywords: string[];
  maxScore: number;
  customRules: CustomRules;
}

export interface AssessmentResult {
  id: string;
  questionId: string;
  studentName?: string;
  rawOcrText: string;
  augmentedText?: string;
  similarityScore: number; // 0-100 percentage
  awardedPoints: number;
  maxPoints: number;
  finalGrade: string;
  feedback: string;
  matchedKeywords: string[];
  missedKeywords: string[];
  timestamp: number;
}

export enum AppState {
  HOME = 'HOME',
  ASSESS = 'ASSESS',
  ADMIN = 'ADMIN',
  RESULTS = 'RESULTS',
}

export interface ProcessingState {
  step: 'idle' | 'uploading' | 'ocr' | 'grading' | 'complete';
  progress: number;
  currentImage?: string;
}