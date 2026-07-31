# SEFAES AI Gateway Foundation

## Overview

The AI Gateway serves as the deterministic routing layer for all AI provider interactions within SEFAES. It enforces the architectural constraints while providing capability-based routing, provider registry, and context propagation.

## Architectural Constraints

### Immutable Components
- ✅ Supabase client
- ✅ database.types.ts
- ✅ RPC layer (rpcClient.ts)
- ✅ CommandBus
- ✅ Context Resolution Engine
- ✅ FSM Engine
- ✅ RLS policies
- ✅ Trigger automation

### Prohibited Operations
- ❌ Direct PostgreSQL access
- ❌ Raw SQL execution
- ❌ Bypassing rpcClient
- ❌ Bypassing CommandBus
- ❌ Bypassing RLS
- ❌ Bypassing FSM
- ❌ Direct table writes

### Required Operations
- ✅ All operations flow through existing business RPCs
- ✅ All mutations pass through CommandBus
- ✅ Context propagation via Context Resolution Engine
- ✅ Structured logging with traceId

## Folder Structure

```
src/ai/
├── gateway/
│   ├── AIGateway.ts              # Main gateway orchestrator
│   ├── GatewayRouter.ts          # Capability-based routing
│   ├── GatewayContext.ts         # Context resolution & propagation
│   ├── GatewayRegistry.ts        # Provider registry management
│   └── GatewayResponse.ts        # Response normalization
├── providers/
│   ├── BaseProvider.ts           # Abstract provider base class
│   ├── QwenProvider.ts           # Qwen model provider
│   ├── LlamaProvider.ts          # Llama model provider
│   └── GemmaProvider.ts          # Gemma model provider
├── types/
│   ├── AIRequest.ts              # Request contract
│   ├── AIResponse.ts             # Response contract
│   ├── AIProvider.ts             # Provider interface
│   └── AgentCapability.ts        # Capability definitions
├── services/
│   └── ProviderRegistry.ts       # Runtime provider service
├── tools/                        # AI tool implementations (future)
├── prompts/                      # Prompt templates (future)
└── schema/                       # Validation schemas (future)
```

## Type Contracts

### AIProvider Interface

```typescript
interface AIProvider {
  name(): string;
  capabilities(): AgentCapability[];
  execute(request: AIRequest): Promise<AIResponse>;
}
```

**Constraints:**
- No business logic in providers
- Pure execution layer only
- Must implement all three methods
- Must return structured AIResponse

### Capability Registry

```typescript
enum AgentCapability {
  // Academic Writing
  ENGINEERING = 'ENGINEERING',
  ACADEMIC_WRITING = 'ACADEMIC_WRITING',
  GRAMMAR = 'GRAMMAR',
  
  // Cognitive Behavioral Therapy
  CBT = 'CBT',
  
  // Assessment
  GRADING = 'GRADING',
  PLAGIARISM = 'PLAGIARISM',
  
  // Document Processing
  OCR = 'OCR',
  
  // Communication
  CHAT = 'CHAT',
  
  // Analytics
  ANALYTICS = 'ANALYTICS'
}
```

### Initial Provider Registry

| Provider | Status | Capabilities |
|----------|--------|--------------|
| Qwen     | Stub   | All (pending implementation) |
| Llama    | Stub   | All (pending implementation) |
| Gemma    | Stub   | All (pending implementation) |

**Excluded Providers:**
- ❌ DeepSeek (not in initial registry)
- ❌ Gemini (not in initial registry - separate geminiService.ts exists)

## Integration Points

### CommandBus Integration

```typescript
interface GatewayCommandBus {
  dispatch<T = any>(command: Command): Promise<CommandResponse<T>>;
  setActor(actorId: string): void;
}
```

**Usage Pattern:**
- Gateway receives AI request
- Gateway validates capability
- Gateway routes to appropriate provider
- Provider executes (stub for now)
- Gateway normalizes response
- Gateway creates async command via CommandBus for persistence

### rpcClient Integration

```typescript
interface GatewayRPCClient {
  callRPC<T = any>(functionName: string, payload?: Record<string, any>): Promise<T>;
  queryTable<T = any>(table: string, query: (builder: any) => any): Promise<T>;
}
```

**Usage Pattern:**
- Gateway uses rpcClient for data reads (provider metadata, etc.)
- Gateway uses rpcClient for business RPC calls
- Gateway NEVER executes raw SQL

### Context Resolution Engine Integration

```typescript
interface GatewayContextEngine {
  resolveTenantContext(identity: Identity): TenantContext;
  validateAccess(context: TenantContext, capability: AgentCapability): boolean;
  propagateContext(context: TenantContext, provider: AIProvider): void;
}
```

**Usage Pattern:**
- Gateway resolves tenant context from identity
- Gateway validates capability access per tenant
- Gateway propagates context to provider execution
- Provider includes context in all operations

## Error Handling

### Error Taxonomy

```typescript
type GatewayErrorCode = 
  | 'PROVIDER_NOT_FOUND'
  | 'CAPABILITY_NOT_SUPPORTED'
  | 'CONTEXT_RESOLUTION_FAILED'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_FAILOVER_TRIGGERED'
  | 'REQUEST_VALIDATION_FAILED'
  | 'RESPONSE_VALIDATION_FAILED';
```

### Error Normalization

All provider errors are normalized to `AIResponse` with:
- `success: false`
- `error.code`: Machine-readable error code
- `error.message`: Human-readable message
- `traceId`: Correlation identifier

## Provider Failover Strategy

```typescript
interface FailoverConfig {
  maxRetries: number;
  timeoutMs: number;
  fallbackOrder: string[];
}
```

**Failover Flow:**
1. Primary provider selection based on capability
2. Timeout monitoring
3. Retry with same provider (maxRetries)
4. Fallback to next provider in capability chain
5. Final error normalization if all fail

## Logging Strategy

### Structured Logging Format

```typescript
interface GatewayLogEntry {
  timestamp: number;
  traceId: string;
  actorId: string;
  capability: AgentCapability;
  provider: string;
  action: 'REQUEST_RECEIVED' | 'PROVIDER_SELECTED' | 'EXECUTION_STARTED' | 'EXECUTION_COMPLETED' | 'ERROR';
  durationMs?: number;
  error?: { code: string; message: string };
}
```

**Log Levels:**
- `info`: Normal operation flow
- `warn`: Failover triggered, recoverable errors
- `error`: Unrecoverable errors, validation failures

## Build Verification

### TypeScript Verification
```bash
npx tsc --noEmit
```

Expected: ✅ No errors

### Build Command
```bash
npm run build
```

Expected: ✅ Build succeeds

## Security Considerations

1. **No API Keys in Gateway**: Initial implementation has no hardcoded API keys
2. **RLS Compliance**: All data access respects RLS policies
3. **Tenant Isolation**: Context resolution enforces tenant boundaries
4. **Audit Trail**: All operations include traceId for observability
5. **Input Validation**: All requests validated against Zod schemas

## Future Extensions

### Tools Directory
- Implementation of structured tool calling
- Integration with external services (via rpcClient only)

### Prompts Directory
- Template management
- Version control for prompts
- A/B testing infrastructure

### Schema Directory
- Zod validation schemas for requests/responses
- Runtime type guards

## Governance

**Modification Protocol:**
1. No changes to provider interface without architectural review
2. New capabilities require enum extension + documentation
3. Provider additions require registration in GatewayRegistry
4. Integration tests required for routing changes

**Review Checklist:**
- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] No direct database access
- [ ] All RPC calls use rpcClient
- [ ] All mutations use CommandBus
- [ ] Context propagation implemented
- [ ] Error normalization complete
- [ ] Structured logging present