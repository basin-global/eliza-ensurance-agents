import { Provider } from '@elizaos/core';

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
  type: 'SECURITY',

  async getContext(message: any, runtime: any) {
    // Check message content for sensitive patterns
    const messageText = message?.content?.text?.toLowerCase() || '';

    const hasSensitiveContent = SENSITIVE_PATTERNS.some(pattern =>
      messageText.includes(pattern)
    );

    if (hasSensitiveContent) {
      return {
        action: 'IGNORE',
        reason: 'SECURITY_VIOLATION',
        response: 'I cannot provide or handle sensitive information like private keys or credentials.'
      };
    }

    // No security concerns
    return null;
  }
};