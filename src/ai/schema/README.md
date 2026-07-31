# AI Schema Definitions

This directory contains schema definitions for AI operations.

## Schema Categories

### Request Schemas
- Zod schemas for AIRequest validation
- Runtime type guards
- Default value providers

### Response Schemas
- Zod schemas for AIResponse validation
- Error response normalization
- Success response formatting

### Provider Schemas
- Configuration schemas
- Environment variable schemas
- Credential schemas (encrypted)

## Guidelines

All schemas should:
- Use Zod for runtime validation
- Include descriptive error messages
- Support schema composition
- Have version control