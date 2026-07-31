# AI Tools

This directory contains AI tool implementations.

## Tool Categories

### Analysis Tools
- Text analysis
- Pattern recognition
- Entity extraction

### Generation Tools
- Content generation
- Code generation
- Document generation

### Integration Tools  
- External API integrations
- Database queries (via rpcClient only)
- File processing

## Guidelines

All tools must:
- Use rpcClient for database operations
- Use CommandBus for mutations
- Respect RLS policies
- Include structured logging
- Return typed results