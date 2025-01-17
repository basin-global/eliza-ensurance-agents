import { Provider } from '@elizaos/core';

// Types for influence system
export interface InfluencedBy {
  operator?: string[];
  individuals?: string[];
  categories?: string[];
  inspirations?: string[];  // Sources of inspiration and motivation
}

export interface SeeksToInfluence {
  audiences?: string[];
  outcomes?: string[];
}

export interface InfluenceConfig {
  influencedBy?: InfluencedBy;
  seeksToInfluence?: SeeksToInfluence;
}

// Combined extended character config
export interface ExtendConfig {
  purpose?: string;
  influence?: InfluenceConfig;
}

// Plugin configuration
export interface PluginConfig {
  providers: Provider[];
}