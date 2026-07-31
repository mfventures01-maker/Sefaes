/**
 * SEFAES AI Gateway - AI Response Contract
 * 
 * Every AI response must conform to this interface.
 * Standardized format for error handling, logging, and consumer consumption.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - No raw database objects in responses
 * - All errors must include traceId
 * - Success responses include data; failure responses include error
 */

import { AgentCapability } from './AgentCapability';

/**
 * Default capability for error responses when the actual capability is unknown.
 */
const DEFAULT_CAPABILITY: AgentCapability = AgentCapability.CHAT;
/**
 * Standardized error structure for AI responses.
 */
export interface AIError {
  /** Machine-readable error code */
  code: AIErrorCode;
  
  /** Human-readable error message (safe for UI) */
  message: string;
  
  /** Globally unique trace ID for debugging */
  traceId: string;
  
  /** Optional provider that produced the error */
  provider?: string;
  
  /** Optional additional context */
  details?: Record<string, any>;
}
/**
 * Error codes for AI Gateway operations.
 */
export type AIErrorCode =
  /** No provider found for the requested capability */
  | 'PROVIDER_NOT_FOUND'
  
  /** Provider does not support the requested capability */
  | 'CAPABILITY_NOT_SUPPORTED'
  
  /** Context resolution failed */
  | 'CONTEXT_RESOLUTION_FAILED'
  
  /** Provider execution timed out */
  | 'PROVIDER_TIMEOUT'
  
  /** Provider failover was triggered and exhausted */
  | 'PROVIDER_FAILOVER_TRIGGERED'
  
  /** Request validation failed */
  | 'REQUEST_VALIDATION_FAILED'
  
  /** Response validation failed */
  | 'RESPONSE_VALIDATION_FAILED'
  
  /** Provider returned an error during execution */
  | 'PROVIDER_EXECUTION_ERROR'
  
  /** Unknown/undefined provider error */
  | 'UNKNOWN_ERROR';
/**
 * Text completion result from AI provider.
 */
export interface AIResult {
  /** Generated text content */
  text: string;
  
  /** Optional structured data extracted/parsed */
  structuredData?: Record<string, any>;
  
  /** Token usage statistics */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  
  /** Provider-specific metadata */
  metadata?: Record<string, any>;
}

/**
 * Standardized AI Response Contract.
 */
export interface AIResponse {
  /** Success flag */
  success: boolean;
  
  /** Globally unique trace ID (matches request traceId) */
  traceId: string;
  
  /** Capability that was executed */
  capability: AgentCapability;
  
  /** Result data (only present on success) */
  data?: AIResult;
  
  /** Error information (only present on failure) */
  error?: AIError;
  
  /** Provider that handled the request */
  provider: string;
  
  /** Execution duration in milliseconds */
  durationMs: number;
  
  /** Timestamp of response creation */
  timestamp: number;
}

/**
 * Creates a successful AI response.
 */
export function createSuccessResponse(
  traceId: string,
  capability: AgentCapability,
  provider: string,
  text: string,
  structuredData?: Record<string, any>,
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number },
  metadata?: Record<string, any>
): AIResponse {
  return {
    success: true,
    traceId,
    capability,
    data: {
      text,
      structuredData,
      usage,
      metadata,
    },
    provider,
    durationMs: 0, // Should be set by caller
    timestamp: Date.now(),
  };
}

/**
 * Creates a failed AI response.
 */
export function createErrorResponse(
  traceId: string,
  code: AIErrorCode,
  message: string,
  provider: string,
  details?: Record<string, any>
): AIResponse {
  return {
    success: false,
    traceId,
    capability: DEFAULT_CAPABILITY, // Default, should be overridden by caller if known
    error: {
      code,
      message,
      traceId,
      provider,
      details,
    },
    provider,
    durationMs: 0,
    timestamp: Date.now(),
  };
}

/**
 * Validates that an object conforms to AIResponse type.
 */
export function isValidAIResponse(value: any): value is AIResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  if (typeof value.success !== 'boolean') {
    return false;
  }
  
  if (typeof value.traceId !== 'string') {
    return false;
  }
  
  if (typeof value.provider !== 'string') {
    return false;
  }
  
  if (typeof value.durationMs !== 'number') {
    return false;
  }
  
  if (value.success && !value.data) {
    return false;
  }
  
  if (!value.success && !value.error) {
    return false;
  }
  
  return true;
}

