import { Provider } from '@elizaos/core';

/**
 * Configuration for impact intentions
 * Currently focused on what agent aims to achieve
 * Future: Add actual impact metrics, verification methods, measurement tools
 *
 * @recommended Limit impact array to 2-5 items for focused mission statement
 */
export interface ImpactConfig {
  impact?: string[];      // What impact the agent aims to make
}

// Plugin configuration
export interface PluginConfig {
  providers: Provider[];
}