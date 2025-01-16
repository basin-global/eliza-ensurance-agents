import { Service } from '@elizaos/core';
import type { PluginConfig } from '../../index';

// Basic module exports
export const tokenboundModule = {
  // Will expand these as needed
  actions: [],
  services: [],
};

// Export types if needed by other modules
export interface TokenboundConfig extends PluginConfig {
  registryAddress?: string;
}