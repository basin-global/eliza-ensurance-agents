import { Provider, Memory, IAgentRuntime, State } from '@elizaos/core';

/**
 * Provider for security validation
 * Currently checks messages for sensitive information patterns
 * Future: Will include more sophisticated pattern matching and context awareness
 */

// Sensitive patterns to check for
const SENSITIVE_PATTERNS = [
  'private key',
  'secret key',
  'seed phrase',
  'mnemonic',
  'password',
  'api key',
  'auth token',
  'credentials'
];

export const securityProvider: Provider = {
  get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Check message content for sensitive patterns
    const messageText = message?.content?.text?.toLowerCase() || '';

    const hasSensitiveContent = SENSITIVE_PATTERNS.some(pattern =>
      messageText.includes(pattern)
    );

    return {
      security: {
        status: hasSensitiveContent ? 'violation' : 'safe',
        action: hasSensitiveContent ? 'ignore' : 'proceed',
        reason: hasSensitiveContent ? 'security_violation' : null,
        detectedPatterns: hasSensitiveContent ?
          SENSITIVE_PATTERNS.filter(pattern => messageText.includes(pattern)) :
          []
      }
    };
  }
};