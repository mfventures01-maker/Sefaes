/**
 * SEFAES AI Gateway - AI Request Contract
 * 
 * Every AI request must conform to this interface.
 * Used for provider selection, capability routing, and validation.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - No raw SQL in requests
 * - No direct database references
 * - All context comes from GatewayContext
 */

import { AgentCapability } from './AgentCapability';

/**
 * Identity context for the request initiator.
 */
export interface AIIdentity {
  /** User ID from session */
  userId: string;
  
  /** User role (student, teacher, admin, etc.) */
  role: string;
  
  /** Institution/school ID for tenant isolation */
  institutionId: string;
  
  /** School ID within institution */
  schoolId?: string;
}

/**
 * Analysis scopes for different AI operations.
 */
export type AIAnalysisScope = 
  | 'GRADING'
  | 'PLAGIARISM'
  | 'GRAMMAR'
  | 'INSIGHTS'
  | 'SUMMARY'
  | 'EXTRACTION';

/**
 * Structured AI Request Contract.
 */
export interface AIRequest<TData = any> {
  /** Globally unique trace ID for observability */
  traceId: string;
  
  /** Required capability for this request */
  capability: AgentCapability;
  
  /** Analysis scope/type */
  scope: AIAnalysisScope;
  
  /** Request identity context */
  identity: AIIdentity;
  
  /** Primary data payload (varies by capability) */
  data: TData;
  
  /** Optional parameters for provider configuration */
  options?: AIRequestOptions;
  
  /** Timestamp in Unix epoch milliseconds */
  timestamp?: number;
}

/**
 * Optional configuration for AI requests.
 */
export interface AIRequestOptions {
  /** Model temperature (0.0 to 1.0) */
  temperature?: number;
  
  /** Maximum tokens to generate */
  maxTokens?: number;
  
  /** Stop sequences */
  stopSequences?: string[];
  
  /** Preferred provider (overrides capability-based selection) */
  preferredProvider?: string;
  
  /** Timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  
  /** Enable provider failover (default: true) */
  enableFailover?: boolean;
  
  /** Additional context (for future extensions) */
  metadata?: Record<string, string>;
}

/**
 * Type guard to validate AI request structure.
 */
export function isValidAIRequest(value: any): value is AIRequest {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  if (typeof value.traceId !== 'string') {
    return false;
  }
  
  if (typeof value.capability !== 'string') {
    return false;
  }
  
  if (!value.identity || typeof value.identity !== 'object') {
    return false;
  }
  
  if (typeof value.identity.userId !== 'string') {
    return false;
  }
  
  if (typeof value.data === 'undefined') {
    return false;
  }
  
  return true;
}

/**
 * Generates a trace ID for AI requests.
 */
export function generateAITraceId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(16).slice(2);
  return `ai_${timestamp}_${random}`;
}

/**
 * Creates a validated AI request with defaults.
 */
export function createAIRequest<TData = any>(
  capability: AgentCapability,
  scope: AIAnalysisScope,
  identity: AIIdentity,
  data: TData,
  options?: AIRequestOptions
): AIRequest<TData> {
  return {
    traceId: generateAITraceId(),
    capability,
    scope,
    identity,
    data,
    options,
    timestamp: Date.now(),
  };
}