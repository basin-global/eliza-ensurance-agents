import type { TokenboundAccount, TokenboundTransaction } from '../types';

// Internal types not exposed to agent

export interface WalletConfig {
  method: 'EOA' | 'SERVER';
  privyAppId?: string;  // For server wallet
}

// Placeholder Privy types - will update with actual SDK types
export interface PrivyTransactionFormat {
  // Will be replaced with actual Privy types
}

export interface WalletTransform {
  toPrivySendEth(account: TokenboundAccount, tx: TokenboundTransaction): PrivyTransactionFormat;
  toPrivySignMessage?(account: TokenboundAccount, tx: TokenboundTransaction): PrivyTransactionFormat;
}