import { Provider, Memory, IAgentRuntime, State } from '@elizaos/core';
import type { PlaceConfig } from './types';

/**
 * Provider for place-based context
 * Currently focused on natural language location descriptions
 * Future: Will support structured spatial data
 */
export const placeProvider: Provider = {
  get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Get place configuration from character settings
    const config = runtime.getSetting('place') as PlaceConfig | undefined;

    return {
      place: {
        location: config?.location || []
      }
    };
  }
};