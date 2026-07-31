/**
 * SEFAES AI Gateway - Gateway Context
 * 
 * Handles context resolution and propagation for AI requests.
 * Integrates with the Context Resolution Engine to enforce tenant isolation.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - No direct database access
 * - Uses rpcClient for data reads
 * - Enforces tenant boundaries
 * - Validates capability access per tenant
 */

import { AIIdentity } from '../types/AIRequest';
import { AgentCapability } from '../types/AgentCapability';

/**
 * Tenant context extracted during context resolution.
 */
export interface TenantContext {
  /** Institution ID */
  institutionId: string;
  
  /** School ID (optional) */
  schoolId?: string;
  
  /** User ID */
  userId: string;
  
  /** User role */
  role: string;
  
  /** Tenant-specific configuration */
  config?: Record<string, any>;
  
  /** Allowed capabilities for this tenant */
  allowedCapabilities: AgentCapability[];
  
  /** Timestamp when context was resolved */
  resolvedAt: number;
}

/**
 * Interface for Context Resolution Engine integration.
 * This defines the contract, implementation comes from existing engine.
 */
export interface IContextResolutionEngine {
  /**
   * Resolves tenant context from identity.
   */
  resolveTenantContext(identity: AIIdentity): Promise<TenantContext>;
  
  /**
   * Validates that a capability is allowed for the tenant.
   */
  validateAccess(context: TenantContext, capability: AgentCapability): boolean;
  
  /**
   * Propagates context to provider environment.
   */
  propagateContext(context: TenantContext, providerName: string): void;
}

/**
 * Default implementation of context resolution.
 * Integrates with existing Context Resolution Engine when available.
 */
export class GatewayContext {
  private readonly ENGINE_TAG = '[GatewayContext]';
  
  /**
   * Resolves tenant context from identity.
   * 
   * TODO: Integrate with actual Context Resolution Engine via rpcClient
   * For now, creates basic context from identity.
   */
  async resolveContext(identity: AIIdentity): Promise<TenantContext> {
    console.info(`${this.ENGINE_TAG} Resolving context for user ${identity.userId}`);
    
    // STUB: Replace with actual Context Resolution Engine call
    // Implementation should call RPC to resolve full tenant context
    // Example: await rpcClient.callRPC('resolve_tenant_context', { userId: identity.userId })
    
    const context: TenantContext = {
      institutionId: identity.institutionId,
      schoolId: identity.schoolId,
      userId: identity.userId,
      role: identity.role,
      resolvedAt: Date.now(),
      allowedCapabilities: Object.values(AgentCapability), // All capabilities for now
    };
    
    console.info(`${this.ENGINE_TAG} Context resolved`, {
      institutionId: context.institutionId,
      allowedCapabilities: context.allowedCapabilities.length,
    });
    
    return context;
  }
  
  /**
   * Validates that a capability is allowed for the tenant.
   */
  validateAccess(context: TenantContext, capability: AgentCapability): boolean {
    const isAllowed = context.allowedCapabilities.includes(capability);
    
    if (!isAllowed) {
      console.warn(`${this.ENGINE_TAG} Capability access denied`, {
        userId: context.userId,
        capability,
      });
    }
    
    return isAllowed;
  }
  
  /**
   * Propagates context to provider environment.
   * 
   * TODO: Implement context propagation mechanism
   * This might set environment variables, headers, or provider-specific context
   */
  propagateContext(context: TenantContext, providerName: string): void {
    console.info(`${this.ENGINE_TAG} Propagating context to provider ${providerName}`, {
      institutionId: context.institutionId,
      userId: context.userId,
    });
    
    // STUB: Implement actual context propagation
    // This could include:
    // - Setting tenant-specific headers for API calls
    // - Injecting institution-specific configuration
    // - Adding context to structured logging
  }
}

/**
 * Default singleton instance.
 */
export const gatewayContext = new GatewayContext();