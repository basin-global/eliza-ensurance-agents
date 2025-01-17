import { Action } from '@elizaos/core';

// Base Tokenbound Account structure (will align with SDK)
export interface TokenboundAccount {
  chainId: number;
  tokenContract: string;
  tokenId: string;
  accountAddress: string;
}

// Base transaction format - only what agent needs to know
export interface TokenboundTransaction {
  to: string;
  value?: string;
  data?: string;
}

// Extended Action type for Tokenbound
export interface TokenboundAction extends Action {
  // No config visible to agent
  // Will handle method/transform at runtime level
}