/**
 * SEFAES AI Gateway - Main Gateway Orchestrator
 * 
 * Central entry point for all AI operations.
 * Orchestrates context resolution, provider selection, execution, and response normalization.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - All operations flow through existing business RPCs
 * - No direct database access
 * - No raw SQL
 * - All mutations pass through CommandBus
 * - Context propagation via Context Resolution Engine
 * - Structured logging with traceId
 */

import { AIRequest, createAIRequest, AIIdentity, AIAnalysisScope, generateAITraceId } from '../types/AIRequest';
import { AIResponse, isValidAIResponse } from '../types/AIResponse';
import { AgentCapability } from '../types/AgentCapability';
import { GatewayContext, TenantContext } from './GatewayContext';
import { GatewayRouter, FailoverConfig } from './GatewayRouter';
import { ProviderRegistry, IProviderRegistry } from '../services/ProviderRegistry';
import { GatewayResponse } from './GatewayResponse';

/**
 * Gateway configuration.
 */
export interface GatewayConfig {
  /** Default timeout in milliseconds */
  defaultTimeoutMs: number;
  
  /** Maximum retries per provider */
  maxRetries: number;
  
  /** Enable provider failover */
  enableFailover: boolean;
  
  /** Enable structured logging */
  enableLogging: boolean;
}

/**
 * Default gateway configuration.
 */
const DEFAULT_CONFIG: GatewayConfig = {
  defaultTimeoutMs: 30000,
  maxRetries: 2,
  enableFailover: true,
  enableLogging: true,
};

/**
 * AI Gateway - Main Orchestrator.
 */
export class AIGateway {
  private readonly contextEngine: GatewayContext;
  private readonly registry: IProviderRegistry;
  private readonly responseNormalizer: GatewayResponse;
  private readonly config: GatewayConfig;
  private readonly LOG_TAG = '[AIGateway]';
  
  private router?: GatewayRouter;
  
  private constructor(
    registry: IProviderRegistry = new ProviderRegistry(),
    config: GatewayConfig = DEFAULT_CONFIG
  ) {
    this.contextEngine = new GatewayContext();
    this.registry = registry;
    this.responseNormalizer = GatewayResponse.getInstance();
    this.config = config;
  }
  
  /**
   * Creates and configures a gateway instance.
   */
  public static create(
    registry?: IProviderRegistry,
    config?: Partial<GatewayConfig>
  ): AIGateway {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const gateway = new AIGateway(registry, mergedConfig);
    
    // Initialize router (requires registry)
    gateway.router = new GatewayRouter(registry || new ProviderRegistry());
    
    console.info(gateway.LOG_TAG, 'AI Gateway initialized', {
      defaultTimeoutMs: mergedConfig.defaultTimeoutMs,
      enableFailover: mergedConfig.enableFailover,
    });
    
    return gateway;
  }
  
  /**
   * Executes an AI request through the gateway.
   * 
   * FLOW:
   * 1. Validate request structure
   * 2. Resolve tenant context
   * 3. Validate capability access
   * 4. Select provider based on capability
   * 5. Propagate context to provider
   * 6. Execute provider with timeout
   * 7. Normalize response
   * 8. Log execution
   */
  async execute(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const { traceId, capability } = request;
    
    if (this.config.enableLogging) {
      console.info(`${this.LOG_TAG} [${traceId}] Request received`, {
        capability,
        identity: { userId: request.identity.userId, role: request.identity.role },
      });
    }
    
    try {
      // Step 1: Validate request
      if (!this.validateRequest(request)) {
        return this.responseNormalizer.normalizeProviderError(
          traceId,
          capability,
          'gateway',
          'Request validation failed',
          this.calculateDuration(startTime)
        );
      }
      
      // Step 2: Resolve tenant context
      const context = await this.contextEngine.resolveContext(request.identity);
      
      // Step 3: Validate capability access
      if (!this.contextEngine.validateAccess(context, capability)) {
        return this.responseNormalizer.normalizeProviderError(
          traceId,
          capability,
          'gateway',
          `Capability ${capability} not allowed for tenant ${context.institutionId}`,
          this.calculateDuration(startTime)
        );
      }
      
      // Step 4: Select provider
      if (!this.router) {
        throw new Error('Gateway not properly initialized: router is null');
      }
      
      const failoverConfig: FailoverConfig = {
        maxRetries: request.options?.timeoutMs ? 1 : this.config.maxRetries,
        timeoutMs: request.options?.timeoutMs ?? this.config.defaultTimeoutMs,
        enableFailover: request.options?.enableFailover ?? this.config.enableFailover,
      };
      
      const routeResult = await this.router.routeRequest(request, failoverConfig);
      
      if (this.config.enableLogging) {
        console.info(`${this.LOG_TAG} [${traceId}] Provider selected`, {
          provider: routeResult.provider.name(),
          isFailover: routeResult.isFailover,
        });
      }
      
      // Step 5: Propagate context
      this.contextEngine.propagateContext(context, routeResult.provider.name());
      
      // Step 6: Execute with timeout
      const timeoutMs = failoverConfig.timeoutMs;
      const response = await this.executeWithTimeout(
        routeResult.provider,
        request,
        timeoutMs
      );
      
      // Ensure response has correct capability
      response.capability = capability;
      
      // Step 7 & 8: Normalize and log
      const duration = this.calculateDuration(startTime);
      const finalResponse = this.responseNormalizer.finalizeResponse(response, duration);
      
      if (this.config.enableLogging) {
        console.info(`${this.LOG_TAG} [${traceId}] Execution completed`, {
          success: finalResponse.success,
          provider: finalResponse.provider,
          durationMs: finalResponse.durationMs,
        });
      }
      
      return finalResponse;
    } catch (error) {
      const duration = this.calculateDuration(startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error(`${this.LOG_TAG} [${traceId}] Execution failed`, {
        error: errorMessage,
      });
      
      return this.responseNormalizer.normalizeProviderError(
        traceId,
        capability,
        'gateway',
        errorMessage,
        duration
      );
    }
  }
  
  /**
   * Executes a provider with timeout handling.
   */
  private async executeWithTimeout(
    provider: any,
    request: AIRequest,
    timeoutMs: number
  ): Promise<AIResponse> {
    const timeoutPromise = new Promise<AIResponse>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Provider timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    const executionPromise = provider.execute(request);
    
    try {
      return await Promise.race([executionPromise, timeoutPromise]);
    } catch (error) {
      // If it's a timeout, create timeout response
      if (error instanceof Error && error.message.includes('timeout')) {
        return this.responseNormalizer.createTimeoutResponse(
          request.traceId,
          request.capability,
          provider.name(),
          timeoutMs
        );
      }
      
      // Otherwise, normalize the error
      return this.responseNormalizer.normalizeProviderError(
        request.traceId,
        request.capability,
        provider.name(),
        error,
        0
      );
    }
  }
  
  /**
   * Validates request structure.
   */
  private validateRequest(request: AIRequest): boolean {
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
    
    // Check capability is supported
    if (!this.registry.isCapabilitySupported(request.capability)) {
      console.warn(`${this.LOG_TAG} Capability not supported`, {
        capability: request.capability,
      });
      return false;
    }
    
    return true;
  }
  
  /**
   * Calculates duration from start time.
   */
  private calculateDuration(startTime: number): number {
    return Math.round(Date.now() - startTime);
  }
  
  /**
   * Creates an AI request with defaults.
   * Convenience method for consumers.
   */
  public static createRequest<TData = any>(
    capability: AgentCapability,
    scope: AIAnalysisScope,
    identity: AIIdentity,
    data: TData,
    options?: Parameters<typeof createAIRequest>[4]
  ): AIRequest<TData> {
    return createAIRequest(capability, scope, identity, data, options);
  }
  
  /**
   * Generates a trace ID.
   * Convenience method for consumers.
   */
  public static generateTraceId(): string {
    return generateAITraceId();
  }
}

/**
 * Default gateway instance (lazy initialization).
 */
let defaultGateway: AIGateway | null = null;

/**
 * Returns the default gateway instance.
 */
export function getDefaultGateway(): AIGateway {
  if (!defaultGateway) {
    defaultGateway = AIGateway.create();
  }
  return defaultGateway;
}

/**
 * Resets the default gateway (for testing).
 */
export function resetDefaultGateway(): void {
  defaultGateway = null;
}
