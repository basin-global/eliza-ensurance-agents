import { Provider } from '@elizaos/core';
import type { ExtendConfig } from './types';

// Provider for purpose
export const purposeProvider: Provider = {
  type: 'PURPOSE',
  async getContext(message: any, runtime: any) {
    const config = runtime.character.onchainAgent as ExtendConfig;
    return {
      purpose: config?.purpose || 'No purpose defined'
    };
  }
};

// Provider for influence
export const influenceProvider: Provider = {
  type: 'INFLUENCE',
  async getContext(message: any, runtime: any) {
    const config = runtime.character.onchainAgent as ExtendConfig;
    return {
      influence: config?.influence || {
        influencedBy: {},
        seeksToInfluence: {}
      }
    };
  }
};