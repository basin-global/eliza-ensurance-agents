import { Provider } from '@elizaos/core';
import type { PluginConfig } from '../../index';

// Provider to supply purpose to agents
export const purposeProvider: Provider = {
  type: 'PURPOSE',

  async getContext(message: any, runtime: any) {
    // Get purpose from the plugin's section in character config
    return {
      purpose: runtime.character.onchainAgent?.purpose || 'No purpose defined'
    };
  }
};

// Export the module
export const purposeModule = {
  providers: [purposeProvider]
};