import { Provider, Memory, IAgentRuntime, State } from '@elizaos/core';
import type { ReputationConfig } from './types';

/**
 * Provider for reputation context
 * Currently supplies aspirational reputation statements
 * Future: Will include verified reputation data
 */
export const reputationProvider: Provider = {
  get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Get reputation configuration from character settings
    const config = runtime.getSetting('reputation') as ReputationConfig | undefined;

    return {
      reputation: {
        aspires: config?.aspires || []
      }
    };
  }
};