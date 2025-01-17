import type { TokenboundTransaction } from '../types';
import type { PrivyTransform, PrivyTransactionFormat } from './types';

export const privyTransform: PrivyTransform = {
  toPrivySendEth(tx: TokenboundTransaction): PrivyTransactionFormat {
    // Will implement actual transformation when we have Privy format
    return {} as PrivyTransactionFormat;
  },

  toPrivySignMessage(tx: TokenboundTransaction): PrivyTransactionFormat {
    // Will implement actual transformation when we have Privy format
    return {} as PrivyTransactionFormat;
  }
};