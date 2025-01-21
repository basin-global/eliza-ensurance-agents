import { Plugin } from '@elizaos/core';
import { tokenboundModule } from './modules/tokenbound';
import { placeModule } from './modules/place';
import { extendModule } from './modules/extend';
import { reputationModule } from './modules/reputation';
import { impactModule } from './modules/impact';
import { OnchainAgentConfig, RuntimeConfig, Module } from './types';

// Re-export types
export * from './modules/tokenbound/types';
export * from './modules/place/types';
export * from './modules/extend/types';
export * from './modules/reputation/types';
export * from './modules/impact/types';
export { OnchainAgentConfig, RuntimeConfig as PluginConfig } from './types';

// Export plugin
export const onchainPlugin: Plugin = {
  name: 'onchain-agent-suite',
  description: 'Suite of onchain agent capabilities',
  actions: [
    ...(tokenboundModule as Module).actions || [],
    ...(placeModule as Module).actions || [],
    ...(extendModule as Module).actions || [],
    ...(reputationModule as Module).actions || [],
    ...(impactModule as Module).actions || []
  ],
  providers: [
    ...(tokenboundModule as Module).providers || [],
    ...(placeModule as Module).providers || [],
    ...(extendModule as Module).providers || [],
    ...(reputationModule as Module).providers || [],
    ...(impactModule as Module).providers || []
  ],
  evaluators: [
    ...(tokenboundModule as Module).evaluators || [],
    ...(placeModule as Module).evaluators || [],
    ...(extendModule as Module).evaluators || [],
    ...(reputationModule as Module).evaluators || [],
    ...(impactModule as Module).evaluators || []
  ]
};