import { Plugin, IAgentRuntime } from '@elizaos/core';
import { OnchainAgentConfig, PluginConfig } from './types';

// Import from modules
import { tokenboundModule } from './modules/tokenbound';
import { placeModule } from './modules/place';
import { purposeModule } from './modules/purpose';
import { reputationModule } from './modules/reputation';
import { impactModule } from './modules/impact';

export class OnchainAgentPlugin implements Plugin {
  name = 'onchain-agent-suite';
  description = 'Suite of onchain agent capabilities';

  // Each module contributes its pieces
  actions = [];
  evaluators = [];
  providers = [];
  services = [];

  private config: PluginConfig;

  constructor(config: PluginConfig = {}) {
    this.config = config;
  }

  async initialize(runtime: IAgentRuntime): Promise<void> {
    // Basic initialization
  }
}

// Re-export module functionality
export * from './modules/tokenbound';
export * from './modules/place';
export * from './modules/purpose';
export * from './modules/reputation';
export * from './modules/impact';
export * from './types';

export default function createOnchainPlugin(config: PluginConfig = {}): Plugin {
  return new OnchainAgentPlugin(config);
}