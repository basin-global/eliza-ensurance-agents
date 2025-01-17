import { TokenboundAction, TokenboundAccount } from '../types';
import type { Address } from 'viem';

interface TokenBalance {
  token_id?: string;
  fungible_id?: string;
  name: string;
  symbol: string;
  decimals: number;
  chain: string;
  total_quantity: number;
  total_quantity_string: string;
  total_value_usd_cents: number;
  queried_wallet_balances: Array<{
    address: string;
    quantity: number;
    quantity_string: string;
    value_usd_cents: number;
  }>;
}

interface SimpleHashBalance {
  fungibles: TokenBalance[];
  groupedBalances: Record<string, TokenBalance[]>;
  ethPrice: number | null;
}

export const getNativeErc20BalanceAction: TokenboundAction = {
  name: 'TBA_GET_NATIVE_ERC20_BALANCE',
  description: 'Get native token and ERC20 balances for the Tokenbound Account',

  async handler(runtime, message, state, options, callback) {
    try {
      const account = runtime.character.onchainAgent?.account as TokenboundAccount;
      if (!account?.accountAddress) {
        throw new Error('No tokenbound account configured');
      }

      const simpleHashKey = runtime.getSetting('SIMPLEHASH_API_KEY');
      if (!simpleHashKey) {
        throw new Error('SimpleHash API key not configured');
      }

      // Get balances from SimpleHash
      const response = await fetch(
        `https://ensitus.xyz/api/simplehash/native-erc20?address=${account.accountAddress}`,
        {
          headers: { 'Authorization': `Bearer ${simpleHashKey}` }
        }
      );

      if (!response.ok) {
        throw new Error(`SimpleHash API error: ${response.statusText}`);
      }

      const data: SimpleHashBalance = await response.json();

      // Format response
      const balances = formatBalances(data);

      if (callback) {
        callback({
          text: balances.join('\n'),
          content: {
            success: true,
            balances: data,
            formatted: balances
          }
        });
      }
      return true;

    } catch (error) {
      if (callback) {
        callback({
          text: `Error getting token balances: ${error.message}`,
          content: { error: error.message }
        });
      }
      return false;
    }
  },

  validate: async (runtime) => {
    const account = runtime.character.onchainAgent?.account as TokenboundAccount;
    return !!(account?.accountAddress && runtime.getSetting('SIMPLEHASH_API_KEY'));
  },

  similes: ['GET_TOKEN_BALANCE', 'CHECK_TOKEN_BALANCE', 'SHOW_TOKENS', 'VIEW_TOKENS'],

  examples: [
    [
      {
        user: 'user',
        content: { text: 'What tokens do I have?' }
      },
      {
        user: 'agent',
        content: {
          text: 'Here are your token balances:\nETH: 1.5 ($3000)\nUSDC: 100 ($100)',
          action: 'TBA_GET_NATIVE_ERC20_BALANCE'
        }
      }
    ]
  ]
};

function formatBalances(data: SimpleHashBalance): string[] {
  const lines: string[] = [];
  const seenBalances = new Set();

  const formatAmount = (amount: string, decimals: number): string => {
    const value = Number(amount) / Math.pow(10, decimals);
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  // Process all balances
  const processBalance = (token: TokenBalance) => {
    if (token.total_quantity_string !== '0') {
      const amount = formatAmount(token.total_quantity_string, token.decimals);
      const usdValue = token.total_value_usd_cents / 100;
      const line = `${token.symbol}: ${amount} ($${usdValue.toFixed(2)})`;

      if (!seenBalances.has(line)) {
        seenBalances.add(line);
        lines.push(line);
      }
    }
  };

  // Process all tokens
  Object.values(data.groupedBalances).flat().forEach(processBalance);
  data.fungibles.forEach(processBalance);

  return lines.length ? lines : ['No token balances found'];
}