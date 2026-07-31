/**
 * SEFAES AI Gateway - Agent Capability Registry
 * 
 * Capabilities define what AI providers can do.
 * Each provider declares its capabilities via capabilities().
 * Gateway routes requests based on capability requirements.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - No provider implements business logic
 * - Capabilities are orthogonal (no overlap in responsibility)
 * - New capabilities require enum extension + documentation
 */

export enum AgentCapability {
  // ── Academic Writing & Engineering ──────────────────────────────────────
  /** Technical and engineering content generation */
  ENGINEERING = 'ENGINEERING',
  
  /** Academic paper writing, citations, structure */
  ACADEMIC_WRITING = 'ACADEMIC_WRITING',
  
  /** Grammar checking and language correction */
  GRAMMAR = 'GRAMMAR',
  
  // ── Cognitive Behavioral Therapy ────────────────────────────────────────
  /** CBT session facilitation and guidance */
  CBT = 'CBT',
  
  // ── Assessment & Grading ────────────────────────────────────────────────
  /** AI-powered script grading and scoring */
  GRADING = 'GRADING',
  
  /** Plagiarism detection and originality checking */
  PLAGIARISM = 'PLAGIARISM',
  
  // ── Document Processing ─────────────────────────────────────────────────
  /** OCR - Optical Character Recognition */
  OCR = 'OCR',
  
  // ── Communication ───────────────────────────────────────────────────────
  /** Chat / Conversational AI */
  CHAT = 'CHAT',
  
  // ── Analytics ───────────────────────────────────────────────────────────
  /** Data analysis, insights generation */
  ANALYTICS = 'ANALYTICS',
}

/**
 * Maps capabilities to their human-readable descriptions.
 */
export const CAPABILITY_DESCRIPTIONS: Record<AgentCapability, string> = {
  [AgentCapability.ENGINEERING]: 'Technical and engineering content generation',
  [AgentCapability.ACADEMIC_WRITING]: 'Academic paper writing, citations, and structure',
  [AgentCapability.GRAMMAR]: 'Grammar checking and language correction',
  [AgentCapability.CBT]: 'Cognitive Behavioral Therapy session facilitation',
  [AgentCapability.GRADING]: 'AI-powered script grading and scoring',
  [AgentCapability.PLAGIARISM]: 'Plagiarism detection and originality checking',
  [AgentCapability.OCR]: 'Optical Character Recognition for document processing',
  [AgentCapability.CHAT]: 'Conversational AI and chat interactions',
  [AgentCapability.ANALYTICS]: 'Data analysis and insights generation',
};

/**
 * Type guard to validate capability enum values.
 */
export function isValidCapability(value: string): value is AgentCapability {
  return Object.values(AgentCapability).includes(value as AgentCapability);
}

/**
 * Returns all available capabilities.
 */
export function getAllCapabilities(): AgentCapability[] {
  return Object.values(AgentCapability);
}