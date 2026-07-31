/**
 * SEFAES AI Gateway - Barrel Export
 * 
 * Central export point for all AI Gateway components.
 */

// Types
export type { AgentCapability } from './types/AgentCapability';
export { CAPABILITY_DESCRIPTIONS, isValidCapability, getAllCapabilities } from './types/AgentCapability';
export type { AIRequest, AIIdentity, AIAnalysisScope, AIRequestOptions } from './types/AIRequest';
export { isValidAIRequest, createAIRequest, generateAITraceId } from './types/AIRequest';
export type { AIResponse, AIError, AIResult, AIErrorCode } from './types/AIResponse';
export { isValidAIResponse, createSuccessResponse, createErrorResponse } from './types/AIResponse';
export type { AIProvider, ProviderMetadata } from './types/AIProvider';
export { isAIProvider } from './types/AIProvider';

// Gateway
export { AIGateway, getDefaultGateway, resetDefaultGateway } from './gateway/AIGateway';
export type { GatewayConfig } from './gateway/AIGateway';
export { GatewayContext } from './gateway/GatewayContext';
export type { TenantContext, IContextResolutionEngine } from './gateway/GatewayContext';
export { GatewayRouter } from './gateway/GatewayRouter';
export type { RouterResult, FailoverConfig, IGatewayCommandBus, IGatewayRPCClient } from './gateway/GatewayRouter';
export { GatewayRegistry } from './gateway/GatewayRegistry';
export { GatewayResponse } from './gateway/GatewayResponse';

// Services
export { ProviderRegistry, providerRegistry } from './services/ProviderRegistry';
export type { IProviderRegistry, ICommandBusIntegration, IRPCClientIntegration } from './services/ProviderRegistry';

// Providers
export { BaseProvider } from './providers/BaseProvider';
export { QwenProvider } from './providers/QwenProvider';
export { LlamaProvider } from './providers/LlamaProvider';
export { GemmaProvider } from './providers/GemmaProvider';

// Bootstrap
export { bootstrapAIGateway, getGateway, resetGateway, isGatewayInitialized } from './bootstrap';