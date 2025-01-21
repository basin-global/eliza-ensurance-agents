import { Provider } from '@elizaos/core';

// Types for influence system
export interface InfluencedBy {
  operator?: string[];
  inspiration?: string[];
}

export interface SeeksToInfluence {
  audiences?: string[];
  outcomes?: string[];
}

export interface InfluenceConfig {
  influencedBy?: InfluencedBy;
  seeksToInfluence?: SeeksToInfluence;
}

/**
 * Configuration for the extend plugin
 * Defines purpose and influence relationships
 */
export interface ExtendConfig {
  purpose?: string[];
  influence?: InfluenceConfig;
}

// Plugin configuration
export interface PluginConfig {
  providers: Provider[];
}