import { Provider } from '@elizaos/core';
import type { ImpactConfig } from './types';

export const impactProvider: Provider = {
  type: 'IMPACT',
  async getContext(message: any, runtime: any) {
    const config = runtime.character.onchainAgent as ImpactConfig;
    return {
      impact: {
        objectives: config?.objectives || 'No objectives defined'
      }
    };
  }
};