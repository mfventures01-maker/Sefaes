/**
 * SEFAES AI Gateway - Bootstrap
 * 
 * Initializes the AI Gateway with all providers.
 * This is the entry point for gateway initialization.
 * 
 * USAGE:
 *   import { bootstrapAIGateway } from '@/ai/bootstrap';
 *   
 *   bootstrapAIGateway();
 */

import { AIGateway } from './gateway/AIGateway';
import { providerRegistry } from './services/ProviderRegistry';
import { QwenProvider } from './providers/QwenProvider';
import { LlamaProvider } from './providers/LlamaProvider';
import { GemmaProvider } from './providers/GemmaProvider';

let gatewayInitialized = false;
let gatewayInstance: AIGateway | null = null;

/**
 * Bootstraps the AI Gateway with all registered providers.
 * 
 * @returns The initialized gateway instance
 */
export function bootstrapAIGateway(): AIGateway {
  if (gatewayInitialized) {
    console.info('[AIGateway] Gateway already initialized');
    return gatewayInstance!;
  }
  
  console.info('[AIGateway] Initializing AI Gateway...');
  
  // Register providers in priority order
  // Lower priority number = higher priority
  providerRegistry.register(new QwenProvider(), { priority: 1 });
  providerRegistry.register(new LlamaProvider(), { priority: 2 });
  providerRegistry.register(new GemmaProvider(), { priority: 3 });
  
  console.info('[AIGateway] Providers registered:', {
    count: providerRegistry.getSummary().totalProviders,
  });
  
  // Create gateway instance
  gatewayInstance = AIGateway.create(providerRegistry);
  gatewayInitialized = true;
  
  // Log summary
  const summary = providerRegistry.getSummary();
  console.info('[AIGateway] Gateway initialized successfully', {
    totalProviders: summary.totalProviders,
    healthyProviders: summary.healthyProviders,
    enabledProviders: summary.enabledProviders,
    totalCapabilities: summary.totalCapabilities,
  });
  
  return gatewayInstance;
}

/**
 * Returns the gateway instance.
 * Call after bootstrapAIGateway() has been called.
 */
export function getGateway(): AIGateway {
  if (!gatewayInitialized || !gatewayInstance) {
    throw new Error('AI Gateway not initialized. Call bootstrapAIGateway() first.');
  }
  return gatewayInstance;
}

/**
 * Resets the gateway (for testing).
 */
export function resetGateway(): void {
  gatewayInitialized = false;
  gatewayInstance = null;
  // Note: Provider registry is not cleared - call providerRegistry.clear() if needed
}

/**
 * Checks if gateway is initialized.
 */
export function isGatewayInitialized(): boolean {
  return gatewayInitialized && gatewayInstance !== null;
}