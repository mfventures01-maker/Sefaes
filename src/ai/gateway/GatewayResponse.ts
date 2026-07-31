/**
 * SEFAES AI Gateway - Gateway Response
 * 
 * Response normalization and error handling utilities.
 * Ensures consistent response format across all providers.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - Always return structured AIResponse
 * - Never expose raw provider errors to client
 * - Include traceId in all responses
 * - Normalize error messages for UI safety
 */

import { AIResponse } from '../types/AIResponse';
import { AgentCapability } from '../types/AgentCapability';

/**
 * Normalizes provider responses to standard AIResponse format.
 * Handles timeout, failover, and error scenarios.
 */
export class GatewayResponse {
  private static readonly INSTANCE = new GatewayResponse();
  
  private constructor() {}
  
  public static getInstance(): GatewayResponse {
    return GatewayResponse.INSTANCE;
  }
  
  /**
   * Handles timeout scenarios.
   * Creates a standardized timeout error response.
   */
  createTimeoutResponse(
    traceId: string,
    capability: AgentCapability,
    providerName: string,
    timeoutMs: number
  ): AIResponse {
    console.warn('[GatewayResponse] Provider timeout', {
      traceId,
      provider: providerName,
      timeoutMs,
    });
    
    return {
      success: false,
      traceId,
      capability,
      error: {
        code: 'PROVIDER_TIMEOUT',
        message: `Provider ${providerName} timed out after ${timeoutMs}ms`,
        traceId,
        provider: providerName,
      },
      provider: providerName,
      durationMs: timeoutMs,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Handles failover scenarios.
   * Creates a standardized failover error response.
   */
  createFailoverResponse(
    traceId: string,
    capability: AgentCapability,
    attemptedProviders: string[],
    lastError: string
  ): AIResponse {
    console.warn('[GatewayResponse] Provider failover exhausted', {
      traceId,
      attemptedProviders,
    });
    
    return {
      success: false,
      traceId,
      capability,
      error: {
        code: 'PROVIDER_FAILOVER_TRIGGERED',
        message: `All providers failed. Last error: ${lastError}`,
        traceId,
        details: {
          attemptedProviders,
          attemptCount: attemptedProviders.length,
        },
      },
      provider: attemptedProviders[attemptedProviders.length - 1] || 'unknown',
      durationMs: 0,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Normalizes provider errors.
   * Ensures safe error messages for UI consumption.
   */
  normalizeProviderError(
    traceId: string,
    capability: AgentCapability,
    providerName: string,
    error: any,
    durationMs: number
  ): AIResponse {
    console.error('[GatewayResponse] Normalizing provider error', {
      traceId,
      provider: providerName,
      error: error instanceof Error ? error.message : String(error),
    });
    
    // Extract safe error message
    const safeMessage = this.extractSafeMessage(error);
    
    return {
      success: false,
      traceId,
      capability,
      error: {
        code: 'PROVIDER_EXECUTION_ERROR',
        message: safeMessage,
        traceId,
        provider: providerName,
      },
      provider: providerName,
      durationMs,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Creates a capability not supported error.
   */
  createCapabilityNotSupportedError(
    traceId: string,
    capability: AgentCapability,
    providerName: string
  ): AIResponse {
    return {
      success: false,
      traceId,
      capability,
      error: {
        code: 'CAPABILITY_NOT_SUPPORTED',
        message: `Provider ${providerName} does not support capability ${capability}`,
        traceId,
        provider: providerName,
      },
      provider: providerName,
      durationMs: 0,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Creates a provider not found error.
   */
  createProviderNotFoundError(
    traceId: string,
    capability: AgentCapability
  ): AIResponse {
    return {
      success: false,
      traceId,
      capability,
      error: {
        code: 'PROVIDER_NOT_FOUND',
        message: `No provider found for capability ${capability}`,
        traceId,
      },
      provider: 'unknown',
      durationMs: 0,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Extracts a safe, human-readable error message.
   * Sanitizes provider-specific errors for UI display.
   */
  private extractSafeMessage(error: any): string {
    if (!error) {
      return 'Unknown error occurred';
    }
    
    if (typeof error === 'string') {
      // Sanitize string errors
      return this.sanitizeMessage(error);
    }
    
    if (error instanceof Error) {
      return this.sanitizeMessage(error.message);
    }
    
    if (typeof error === 'object' && error.message) {
      return this.sanitizeMessage(error.message);
    }
    
    return 'An unexpected error occurred';
  }
  
  /**
   * Sanitizes error messages to prevent information leakage.
   */
  private sanitizeMessage(message: string): string {
    // Remove potential sensitive information
    let sanitized = message;
    
    // Remove file paths
    sanitized = sanitized.replace(/[\/\\].+[\/\\]/g, '[path]/');
    
    // Remove API keys (common patterns)
    sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{32,}/g, '[API_KEY]');
    
    // Remove stack traces
    const stackIndex = sanitized.indexOf('\n    at ');
    if (stackIndex !== -1) {
      sanitized = sanitized.substring(0, stackIndex);
    }
    
    // Limit length
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200) + '...';
    }
    
    return sanitized;
  }
  
  /**
   * Wraps a successful response with metadata.
   */
  finalizeResponse(response: AIResponse, durationMs: number): AIResponse {
    return {
      ...response,
      durationMs,
      timestamp: Date.now(),
    };
  }
}