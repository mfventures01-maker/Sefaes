/**
 * SEFAES AI Gateway - Gateway Registry
 * 
 * Provider discovery and registration.
 * Maintains the registry of available AI providers.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - No direct provider instantiation (use factory)
 * - Providers are discovered, not created
 * - Integration with ProviderRegistry service
 */

import { AIProvider, isAIProvider } from '../types/AIProvider';
import { AgentCapability } from '../types/AgentCapability';
import { ProviderMetadata } from '../types/AIProvider';

/**
 * Provider entry in the registry.
 */
interface ProviderEntry {
  provider: AIProvider;
  metadata: ProviderMetadata;
  registeredAt: number;
}

/**
 * Gateway Provider Registry.
 * Manages the collection of available AI providers.
 */
export class GatewayRegistry {
  private static INSTANCE: GatewayRegistry | null = null;
  private readonly providers: Map<string, ProviderEntry> = new Map();
  private readonly LOG_TAG = '[GatewayRegistry]';
  
  private constructor() {}
  
  /**
   * Returns the singleton instance.
   */
  public static getInstance(): GatewayRegistry {
    if (!GatewayRegistry.INSTANCE) {
      GatewayRegistry.INSTANCE = new GatewayRegistry();
    }
    return GatewayRegistry.INSTANCE;
  }
  
  /**
   * Registers a provider.
   */
  register(provider: AIProvider, options?: { priority?: number }): void {
    if (!isAIProvider(provider)) {
      throw new Error('Invalid provider: does not implement AIProvider interface');
    }
    
    const name = provider.name();
    
    if (this.providers.has(name)) {
      console.warn(`${this.LOG_TAG} Provider ${name} already registered, re-registering`);
    }
    
    const capabilities = provider.capabilities();
    
    if (capabilities.length === 0) {
      console.warn(`${this.LOG_TAG} Provider ${name} has no capabilities`);
    }
    
    const entry: ProviderEntry = {
      provider,
      metadata: {
        name,
        capabilities,
        enabled: true,
        priority: options?.priority ?? 1,
        lastHealthCheck: Date.now(),
        healthy: true,
      },
      registeredAt: Date.now(),
    };
    
    this.providers.set(name, entry);
    
    console.info(`${this.LOG_TAG} Provider registered`, {
      name,
      capabilities: capabilities.length,
      priority: entry.metadata.priority,
    });
  }
  
  /**
   * Unregisters a provider.
   */
  unregister(name: string): boolean {
    if (!this.providers.has(name)) {
      console.warn(`${this.LOG_TAG} Provider ${name} not found for unregistration`);
      return false;
    }
    
    this.providers.delete(name);
    console.info(`${this.LOG_TAG} Provider unregistered`, { name });
    
    return true;
  }
  
  /**
   * Gets a provider by name.
   */
  getProvider(name: string): AIProvider | null {
    const entry = this.providers.get(name);
    return entry?.provider ?? null;
  }
  
  /**
   * Gets provider metadata.
   */
  getProviderMetadata(name: string): ProviderMetadata | null {
    const entry = this.providers.get(name);
    return entry?.metadata ?? null;
  }
  
  /**
   * Gets all providers.
   */
  getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values()).map(entry => entry.provider);
  }
  
  /**
   * Gets all provider metadata.
   */
  getAllMetadata(): ProviderMetadata[] {
    return Array.from(this.providers.values()).map(entry => entry.metadata);
  }
  
  /**
   * Gets providers that support a specific capability.
   */
  getProvidersForCapability(capability: AgentCapability): AIProvider[] {
    const result: AIProvider[] = [];
    
    for (const entry of this.providers.values()) {
      if (entry.metadata.enabled && entry.metadata.capabilities.includes(capability)) {
        result.push(entry.provider);
      }
    }
    
    return result;
  }
  
  /**
   * Validates that a capability is supported by at least one provider.
   */
  isCapabilitySupported(capability: AgentCapability): boolean {
    return this.getProvidersForCapability(capability).length > 0;
  }
  
  /**
   * Updates provider health status.
   */
  updateHealth(name: string, healthy: boolean): void {
    const entry = this.providers.get(name);
    if (entry) {
      entry.metadata.healthy = healthy;
      entry.metadata.lastHealthCheck = Date.now();
      
      const status = healthy ? 'healthy' : 'unhealthy';
      console.info(`${this.LOG_TAG} Provider health updated`, {
        name,
        status,
      });
    } else {
      console.warn(`${this.LOG_TAG} Provider ${name} not found for health update`);
    }
  }
  
  /**
   * Enables a provider.
   */
  enableProvider(name: string): void {
    const entry = this.providers.get(name);
    if (entry) {
      entry.metadata.enabled = true;
      console.info(`${this.LOG_TAG} Provider enabled`, { name });
    }
  }
  
  /**
   * Disables a provider.
   */
  disableProvider(name: string): void {
    const entry = this.providers.get(name);
    if (entry) {
      entry.metadata.enabled = false;
      console.info(`${this.LOG_TAG} Provider disabled`, { name });
    }
  }
  
  /**
   * Returns the total number of registered providers.
   */
  getProviderCount(): number {
    return this.providers.size;
  }
  
  /**
   * Returns a summary of the registry.
   */
  getRegistrySummary(): {
    totalProviders: number;
    healthyProviders: number;
    enabledProviders: number;
    totalCapabilities: number;
  } {
    let healthyCount = 0;
    let enabledCount = 0;
    const capabilitySet = new Set<AgentCapability>();
    
    for (const entry of this.providers.values()) {
      if (entry.metadata.healthy) healthyCount++;
      if (entry.metadata.enabled) enabledCount++;
      entry.metadata.capabilities.forEach(cap => capabilitySet.add(cap));
    }
    
    return {
      totalProviders: this.providers.size,
      healthyProviders: healthyCount,
      enabledProviders: enabledCount,
      totalCapabilities: capabilitySet.size,
    };
  }
  
  /**
   * Clears all providers (for testing).
   */
  clear(): void {
    this.providers.clear();
    console.info(`${this.LOG_TAG} Registry cleared`);
  }
}