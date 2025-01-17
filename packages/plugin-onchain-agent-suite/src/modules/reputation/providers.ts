import { Provider } from '@elizaos/core';
import type { ReputationConfig } from './types';

export const reputationProvider: Provider = {
  type: 'REPUTATION',
  async getContext(message: any, runtime: any) {
    const config = runtime.character.onchainAgent as ReputationConfig;
    return {
      reputation: {
        aspirations: config?.aspirations || 'No aspirations defined'
      }
    };
  }
};