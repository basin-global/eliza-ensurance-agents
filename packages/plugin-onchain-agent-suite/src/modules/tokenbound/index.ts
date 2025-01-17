import { Service } from '@elizaos/core';
import type { PluginConfig } from '../../index';
import { securityProvider } from './providers/security';
import { policyEvaluator } from './evaluators/policy';

// Basic module exports
export const tokenboundModule = {
  // Will expand these as needed
  actions: [],
  services: [],
  providers: [securityProvider],
  evaluators: [policyEvaluator]
};

// Export types if needed by other modules
export interface TokenboundConfig extends PluginConfig {
  registryAddress?: string;
}