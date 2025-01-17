import { Provider } from '@elizaos/core';

/**
 * Configuration for reputation management
 * Currently focused on aspirational reputation
 * Future: Add verification methods, attestation support, reputation scores
 *
 * @recommended Limit aspires array to 2-4 items for clear reputation goals
 */
export interface ReputationConfig {
  aspires?: string[];    // How agent wants to be perceived/trusted
}

// Plugin configuration
export interface PluginConfig {
  providers: Provider[];
}