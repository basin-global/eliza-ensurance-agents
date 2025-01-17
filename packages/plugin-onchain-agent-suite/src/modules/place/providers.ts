import { Provider } from '@elizaos/core';
import type { PlaceConfig } from './types';

export const placeProvider: Provider = {
  type: 'PLACE',
  async getContext(message: any, runtime: any) {
    const config = runtime.character.onchainAgent as PlaceConfig;
    return {
      place: {
        location: config?.location || 'No location defined'
      }
    };
  }
};