/**
 * SEFAES AI Gateway - Gateway Router
 * 
 * Capability-based routing layer.
 * Selects appropriate provider based on request capability and provider availability.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - No business logic
 * - Pure routing based on capability
 * - Supports failover chains
 * - Integrates with ProviderRegistry
 */

import { IProviderRegistry } from '../services/ProviderRegistry';
import { AIRequest } from '../types/AIRequest';
import { AIProvider } from '../types/AIProvider';
import { AgentCapability } from '../types/AgentCapability';

export interface RouterResult {
  /** Selected provider */
  provider: AIProvider;
  
  /** Whether this provider was selected via failover */
  isFailover: boolean;
  
  /** Failed providers (if any) */
  failedProviders?: string[];
}

export interface FailoverConfig {
  maxRetries: number;
  timeoutMs: number;
  enableFailover: boolean;
}

/**
 * Interface for CommandBus integration.
 * Defines the contract without implementing.
 */
export interface IGatewayCommandBus {
  dispatch<T = any>(command: { type: string; payload: any; traceId?: string }): Promise<any>;
  setActor(actorId: string): void;
}

/**
 * Interface for RPC Client integration.
 * Defines the contract without implementing.
 */
export interface IGatewayRPCClient {
  callRPC<T = any>(functionName: string, payload?: Record<string, any>): Promise<T>;
  queryTable<T = any>(table: string, query: (builder: any) => any): Promise<T>;
}

/**
 * Capability-based provider router.
 */
export class GatewayRouter {
  private readonly registry: IProviderRegistry;
  private readonly commandBus?: IGatewayCommandBus;
  private readonly rpcClient?: IGatewayRPCClient;
  
  private readonly defaultConfig: FailoverConfig = {
    maxRetries: 2,
    timeoutMs: 30000,
    enableFailover: true,
  };
  
  constructor(
    registry: IProviderRegistry,
    commandBus?: IGatewayCommandBus,
    rpcClient?: IGatewayRPCClient
  ) {
    this.registry = registry;
    this.commandBus = commandBus;
    this.rpcClient = rpcClient;
  }
  
  /**
   * Routes a request to an appropriate provider.
   * Handles capability matching, provider selection, and failover.
   */
  async routeRequest(
    request: AIRequest,
    config: FailoverConfig = this.defaultConfig
  ): Promise<RouterResult> {
    const { capability, options } = request;
    
    // Check for preferred provider override
    if (options?.preferredProvider) {
      const preferredProvider = this.registry.getProvider(options.preferredProvider);
      if (!preferredProvider) {
        throw new Error(`Preferred provider ${options.preferredProvider} not found`);
      }
      
      // Verify capability support
      if (!preferredProvider.capabilities().includes(capability)) {
        throw new Error(
          `Preferred provider ${options.preferredProvider} does not support capability ${capability}`
        );
      }
      
      return {
        provider: preferredProvider,
        isFailover: false,
      };
    }
    
    // Get all providers that support this capability
    const availableProviders = this.registry.getProvidersForCapability(capability);
    
    if (availableProviders.length === 0) {
      throw new Error(`No providers available for capability ${capability}`);
    }
    
    // Sort providers by priority (lower = higher priority)
    availableProviders.sort((a, b) => {
      const metaA = this.registry.getProviderMetadata(a.name());
      const metaB = this.registry.getProviderMetadata(b.name());
      return (metaA?.priority ?? 1) - (metaB?.priority ?? 1);
    });
    
    // Attempt providers in priority order
    const failedProviders: string[] = [];
    
    for (const provider of availableProviders) {
      // Check provider health
      const metadata = this.registry.getProviderMetadata(provider.name());
      if (metadata?.healthy === false) {
        console.warn('[GatewayRouter] Skipping unhealthy provider', {
          provider: provider.name(),
        });
        failedProviders.push(provider.name());
        continue;
      }
      
      // If this is the first provider and we're not using failover, just return it
      if (failedProviders.length === 0) {
        return {
          provider,
          isFailover: false,
        };
      }
      
      // This is a failover provider
      return {
        provider,
        isFailover: true,
        failedProviders,
      };
    }
    
    // No healthy providers found
    throw new Error(
      `No healthy providers available for capability ${capability}. Failed: ${failedProviders.join(', ')}`
    );
  }
  
  /**
   * Returns all providers supporting a capability.
   */
  getProvidersForCapability(capability: AgentCapability): AIProvider[] {
    return this.registry.getProvidersForCapability(capability);
  }
  
  /**
   * Returns the best provider for a capability (no failover consideration).
   */
  getBestProvider(capability: AgentCapability): AIProvider | null {
    const providers = this.getProvidersForCapability(capability);
    if (providers.length === 0) {
      return null;
    }
    
    // Sort by priority and return first
    providers.sort((a, b) => {
      const metaA = this.registry.getProviderMetadata(a.name());
      const metaB = this.registry.getProviderMetadata(b.name());
      return (metaA?.priority ?? 1) - (metaB?.priority ?? 1);
    });
    
    return providers[0];
  }
}