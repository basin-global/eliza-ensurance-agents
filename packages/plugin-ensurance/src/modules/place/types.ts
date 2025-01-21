import { Provider } from '@elizaos/core';

/**
 * Configuration for place-based features
 * Currently focused on natural language location descriptions
 * Future: Add structured location data (coordinates, geojson, h3, etc.)
 *
 * @recommended Limit location array to 1-3 items for focused spatial context
 */
export interface PlaceConfig {
  location?: string[];      // Natural language location descriptions
}

// Plugin configuration
export interface PluginConfig {
  providers: Provider[];
}