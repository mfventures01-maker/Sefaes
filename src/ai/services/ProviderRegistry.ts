/**
 * SEFAES AI Gateway - Provider Registry Service
 * 
 * Runtime service for provider management.
 * Wraps GatewayRegistry with integration hooks.
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * - No business logic
 * - Pure service layer
 * - Integration only, not implementation
 */

import { GatewayRegistry } from '../gateway/GatewayRegistry';
import { AIProvider } from '../types/AIProvider';
import { AgentCapability } from '../types/AgentCapability';
import { ProviderMetadata } from '../types/AIProvider';

/**
 * Interface for CommandBus integration.
 * To be connected to actual CommandBus at runtime.
 */
export interface ICommandBusIntegration {
  dispatch<T = any>(command: { type: string; payload: any; traceId?: string }): Promise<any>;
  setActor(actorId: string): void;
}

/**
 * Interface for RPC Client integration.
 * To be connected to actual rpcClient at runtime.
 */
export interface IRPCClientIntegration {
  callRPC<T = any>(functionName: string, payload?: Record<string, any>): Promise<T>;
  queryTable<T = any>(table: string, query: (builder: any) => any): Promise<T>;
}

/**
 * Provider Registry Service interface.
 * Defines the contract for consumer code.
 */
export interface IProviderRegistry {
  getProvider(name: string): AIProvider | null;
  getProviderMetadata(name: string): ProviderMetadata | null;
  getAllProviders(): AIProvider[];
  getProvidersForCapability(capability: AgentCapability): AIProvider[];
  isCapabilitySupported(capability: AgentCapability): boolean;
  register(provider: AIProvider, options?: { priority?: number }): void;
  unregister(name: string): boolean;
  enableProvider(name: string): void;
  disableProvider(name: string): void;
  updateHealth(name: string, healthy: boolean): void;
}

/**
 * Provider Registry Service.
 * Runtime wrapper around GatewayRegistry.
 */
export class ProviderRegistry implements IProviderRegistry {
  private readonly registry: GatewayRegistry;
  private commandBus?: ICommandBusIntegration;
  private rpcClient?: IRPCClientIntegration;
  
  constructor() {
    this.registry = GatewayRegistry.getInstance();
  }
  
  /**
   * Integrates with CommandBus.
   * Allows registry to emit events, audit logs via CommandBus.
   */
  setCommandBus(commandBus: ICommandBusIntegration): void {
    this.commandBus = commandBus;
    console.info('[ProviderRegistry] CommandBus integration established');
  }
  
  /**
   * Integrates with RPC Client.
   * Allows registry to read provider configuration, etc.
   */
  setRPCClient(rpcClient: IRPCClientIntegration): void {
    this.rpcClient = rpcClient;
    console.info('[ProviderRegistry] RPC Client integration established');
  }
  
  /**
   * Get a provider by name.
   */
  getProvider(name: string): AIProvider | null {
    return this.registry.getProvider(name);
  }
  
  /**
   * Get provider metadata.
   */
  getProviderMetadata(name: string): ProviderMetadata | null {
    return this.registry.getProviderMetadata(name);
  }
  
  /**
   * Get all registered providers.
   */
  getAllProviders(): AIProvider[] {
    return this.registry.getAllProviders();
  }
  
  /**
   * Get providers supporting a specific capability.
   */
  getProvidersForCapability(capability: AgentCapability): AIProvider[] {
    return this.registry.getProvidersForCapability(capability);
  }
  
  /**
   * Check if a capability is supported.
   */
  isCapabilitySupported(capability: AgentCapability): boolean {
    return this.registry.isCapabilitySupported(capability);
  }
  
  /**
   * Register a provider.
   */
  register(provider: AIProvider, options?: { priority?: number }): void {
    this.registry.register(provider, options);
    
    // TODO: Emit registration event via CommandBus
    // Example:
    // if (this.commandBus) {
    //   await this.commandBus.dispatch({
    //     type: 'AI.PROVIDER_REGISTERED',
    //     payload: { name: provider.name() },
    //   });
    // }
  }
  
  /**
   * Unregister a provider.
   */
  unregister(name: string): boolean {
    return this.registry.unregister(name);
  }
  
  /**
   * Enable a provider.
   */
  enableProvider(name: string): void {
    this.registry.enableProvider(name);
  }
  
  /**
   * Disable a provider.
   */
  disableProvider(name: string): void {
    this.registry.disableProvider(name);
  }
  
  /**
   * Update provider health status.
   */
  updateHealth(name: string, healthy: boolean): void {
    this.registry.updateHealth(name, healthy);
  }
  
  /**
   * Get registry summary.
   */
  getSummary(): {
    totalProviders: number;
    healthyProviders: number;
    enabledProviders: number;
    totalCapabilities: number;
  } {
    return this.registry.getRegistrySummary();
  }
}

/**
 * Default singleton instance.
 */
export const providerRegistry = new ProviderRegistry();