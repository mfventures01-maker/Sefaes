/**
 * SEFAES AI Gateway - Base Provider
 * 
 * Abstract base class for all AI providers.
 * Provides common functionality: logging, error handling, validation.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - No business logic
 * - No database access
 * - Common utilities only
 */

import { AIProvider } from '../types/AIProvider';
import { AIRequest } from '../types/AIRequest';
import { AIResponse, createSuccessResponse, createErrorResponse } from '../types/AIResponse';
import { AgentCapability } from '../types/AgentCapability';

/**
 * Abstract base provider class.
 * 
 * All providers MUST extend this class to ensure consistent
 * error handling, logging, and response formatting.
 */
export abstract class BaseProvider implements AIProvider {
  /**
   * Returns the provider's unique identifier.
   * Must be implemented by concrete providers.
   */
  abstract name(): string;
  
  /**
   * Returns capabilities supported by this provider.
   * Must be implemented by concrete providers.
   */
  abstract capabilities(): AgentCapability[];
  
  /**
   * Executes the AI request.
   * Must be implemented by concrete providers.
   * 
   * IMPLEMENTATION REQUIREMENTS:
   * - Return AIResponse, never throw
   * - Include traceId in response
   * - Handle timeouts internally
   */
  abstract execute(request: AIRequest): Promise<AIResponse>;
  
  /**
   * Validates that the request is well-formed.
   * Can be overridden by providers for custom validation.
   */
  protected validateRequest(request: AIRequest): boolean {
    // Check basic presence
    if (!request) {
      return false;
    }
    
    // Check required fields
    if (typeof request.traceId !== 'string' || request.traceId.length === 0) {
      return false;
    }
    
    if (!request.capability) {
      return false;
    }
    
    if (!request.identity || !request.identity.userId) {
      return false;
    }
    
    // Check capability support
    const supportedCaps = this.capabilities();
    if (!supportedCaps.includes(request.capability)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Creates a standardized error response.
   * Helper method for consistent error formatting.
   */
  protected createError(
    traceId: string,
    code: string,
    message: string,
    details?: Record<string, any>
  ): AIResponse {
    return createErrorResponse(traceId, code as any, message, this.name(), details);
  }
  
  /**
   * Creates a standardized success response.
   * Helper method for consistent success formatting.
   */
  protected createSuccess(
    traceId: string,
    capability: AgentCapability,
    text: string,
    structuredData?: Record<string, any>,
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number },
    metadata?: Record<string, any>
  ): AIResponse {
    return createSuccessResponse(
      traceId,
      capability,
      this.name(),
      text,
      structuredData,
      usage,
      metadata
    );
  }
  
  /**
   * Logs provider events with structured format.
   * Default implementation logs to console.
   * Can be overridden for custom logging.
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${this.name().toUpperCase()}]`;
    const logFn = console[level] ?? console.log;
    
    logFn(`${prefix} [${level.toUpperCase()}] ${timestamp} - ${message}`, context || '');
  }
  
  /**
   * Calculates execution duration.
   */
  protected calculateDuration(startTime: number): number {
    return Math.round(Date.now() - startTime);
  }
  
  /**
   * Checks if provider supports a specific capability.
   * Convenience method for gateway routing.
   */
  public supportsCapability(capability: AgentCapability): boolean {
    return this.capabilities().includes(capability);
  }
  
  /**
   * Returns provider metadata for discovery.
   */
  public getMetadata(): {
    name: string;
    capabilities: AgentCapability[];
    enabled: boolean;
    priority: number;
    healthy: boolean;
  } {
    return {
      name: this.name(),
      capabilities: this.capabilities(),
      enabled: true,
      priority: 1, // Default priority, can be overridden
      healthy: true, // Default healthy status
    };
  }
}