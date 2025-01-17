import { Provider, Memory, IAgentRuntime, State } from '@elizaos/core';
import type { ImpactConfig } from './types';

/**
 * Provider for impact intentions
 * Currently supplies what impact the agent aims to make
 * Future: Will include actual impact measurements
 */
export const impactProvider: Provider = {
  get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Get impact configuration from character settings
    const config = runtime.getSetting('impact') as ImpactConfig | undefined;

    return {
      impact: {
        impact: config?.impact || []
      }
    };
  }
};