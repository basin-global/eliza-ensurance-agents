import { Provider, Memory, IAgentRuntime, State } from '@elizaos/core';
import type { ExtendConfig } from './types';

/**
 * Provider for retrieving agent's purpose
 * Supplies purpose context for message generation and decision making
 */
export const purposeProvider: Provider = {
  get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Get extend configuration from character settings
    const config = runtime.getSetting('extend') as ExtendConfig | undefined;

    return {
      purpose: config?.purpose || []
    };
  }
};

/**
 * Provider for influence relationships
 * Manages influence context including operator relationships and inspirations
 */
export const influenceProvider: Provider = {
  get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Get extend configuration from character settings
    const config = runtime.getSetting('extend') as ExtendConfig | undefined;

    return {
      influence: config?.influence || {
        influencedBy: {
          operator: [],
          inspiration: []
        },
        seeksToInfluence: {
          audiences: [],
          outcomes: []
        }
      }
    };
  }
};