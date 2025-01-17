# Onchain Agent Suite Plugin

A plugin providing onchain agent capabilities including place, reputation, impact, and extension features.

## Features

- Place-based context
- Reputation management
- Impact tracking
- Core extensions (purpose and influence)

## Testing

Run tests from the root directory:
```bash
# Run tests for this plugin
pnpm --filter @elizaos/plugin-onchain-agent-suite test

# Run tests in watch mode during development
pnpm --filter @elizaos/plugin-onchain-agent-suite test:watch
```

The test suite covers basic functionality of all providers:
- Place provider
- Reputation provider
- Impact provider
- Extend providers (purpose and influence)