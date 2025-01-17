import { Plugin, Action, Provider, Evaluator } from '@elizaos/core';
import { TokenboundAccount } from './modules/tokenbound/types';
import { PlaceDescription } from './modules/place/types';

// Auth types for different scenarios
export type EOAAuth = {
  type: 'eoa';
  privateKeySecret?: string;  // Optional: Name of secret containing private key
                             // If not provided, will check env.TOKENBOUND_PRIVATE_KEY
}

export type ServerAuth = {
  type: 'server';
  privyAppId?: string;       // Optional: Direct app ID or will check env.NEXT_PUBLIC_PRIVY_APP_ID
  privySecretName?: string;  // Optional: Name of secret or will check env.PRIVY_APP_SECRET
  authKeyName?: string;      // Optional: Name of secret or will check env.PRIVY_AUTH_KEY
}

// Module type definition
export interface Module {
  actions?: Action[];
  providers?: Provider[];
  evaluators?: Evaluator[];
  initialize?: (runtime: any) => Promise<void>;
}

// Plugin configuration in character file
export interface OnchainAgentConfig {
  account: TokenboundAccount;
  purpose?: string;
  place?: PlaceDescription;
  auth: EOAAuth | ServerAuth;
}

// Plugin runtime config
export interface RuntimeConfig {
  provider?: string;
}

// Re-export as PluginConfig for backwards compatibility
export type PluginConfig = RuntimeConfig;