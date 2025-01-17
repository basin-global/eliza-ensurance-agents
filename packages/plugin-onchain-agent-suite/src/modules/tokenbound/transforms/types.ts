import type { TokenboundTransaction } from '../types';

// Placeholder Privy types - will update with actual SDK types
export interface PrivyTransactionFormat {
  // Will be replaced with actual Privy types
}

// Transform interface
export interface PrivyTransform {
  toPrivySendEth(tx: TokenboundTransaction): PrivyTransactionFormat;
  toPrivySignMessage?(tx: TokenboundTransaction): PrivyTransactionFormat;
  // Will add more transform methods as needed
}