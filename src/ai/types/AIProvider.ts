/**
 * SEFAES AI Gateway - AI Provider Interface
 * 
 * Every AI provider MUST implement this interface.
 * This is the contract between the Gateway and individual providers.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - No business logic in providers
 * - Providers are pure execution layer
 * - All providers must implement all three methods
 * - No direct database access
 * - No raw SQL
 */

import { AIRequest } from './AIRequest';
import { AIResponse } from './AIResponse';
import { AgentCapability } from './AgentCapability';

/**
 * AI Provider Contract.
 * 
 * Every LLM/AI provider integration must implement this interface.
 * The Gateway uses this to discover capabilities and execute requests.
 */
export interface AIProvider {
  /**
   * Returns the provider's unique identifier.
   * Used for logging, routing, and failover.
   * 
   * @example Returns: "qwen", "llama", "gemma"
   */
  name(): string;
  
  /**
   * Returns the list of capabilities this provider supports.
   * Used for capability-based routing.
   * 
   * @example Returns: [AgentCapability.GRAMMAR, AgentCapability.GRADING]
   */
  capabilities(): AgentCapability[];
  
  /**
   * Executes an AI request and returns a structured response.
   * This is the ONLY method called by the Gateway for execution.
   * 
   * @param request - The AI request to execute
   * @returns Promise resolving to AIResponse
   * 
   * IMPLEMENTATION REQUIREMENTS:
   * - Must handle timeout internally if specified in request.options
   * - Must NEVER throw uncaught exceptions (always return error response)
   * - Must NEVER contain business logic (pure execution only)
   * - Must NEVER access database directly
   * - Must include traceId in response
   */
  execute(request: AIRequest): Promise<AIResponse>;
}

/**
 * Provider metadata for runtime discovery.
 */
export interface ProviderMetadata {
  /** Provider name */
  name: string;
  
  /** Capabilities supported */
  capabilities: AgentCapability[];
  
  /** Whether provider is enabled */
  enabled: boolean;
  
  /** Provider priority (lower = higher priority) */
  priority: number;
  
  /** Last health check timestamp */
  lastHealthCheck?: number;
  
  /** Whether provider is currently healthy */
  healthy: boolean;
}

/**
 * Type guard to validate AIProvider interface.
 * 
 * Note: This is a structural check, not a runtime guarantee.
 * Actual method correctness is verified through testing.
 */
export function isAIProvider(value: any): value is AIProvider {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  if (typeof value.name !== 'function') {
    return false;
  }
  
  if (typeof value.capabilities !== 'function') {
    return false;
  }
  
  if (typeof value.execute !== 'function') {
    return false;
  }
  
  // Verify name() returns string
  const nameResult = value.name();
  if (typeof nameResult !== 'string' || nameResult.length === 0) {
    return false;
  }
  
  // Verify capabilities() returns array
  const capabilitiesResult = value.capabilities();
  if (!Array.isArray(capabilitiesResult)) {
    return false;
  }
  
  return true;
}