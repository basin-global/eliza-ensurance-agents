import { Action, IAgentRuntime } from '@elizaos/core';
import { ExtendedCharacter } from '../../../types';
import { TokenboundAccount } from '../types';
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
    value_usd_string?: string;
  }>;
}

interface SimpleHashBalance {
  fungibles: TokenBalance[];
  groupedBalances: Record<string, TokenBalance[]>;
  ethPrice: number | null;
}

function formatBalanceResponse(data: SimpleHashBalance): string {
  console.log('Formatting response data:', JSON.stringify(data, null, 2));
  const lines: string[] = [];
  const seenBalances = new Set();

  const formatTokenAmount = (amount: string, decimals: number): string => {
    const value = Number(amount) / Math.pow(10, decimals);
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const processBalance = (token: TokenBalance) => {
    if (token.total_quantity_string !== "0") {
      const amount = formatTokenAmount(token.total_quantity_string, token.decimals);
      const usdValue = token.total_value_usd_cents / 100;
      const balanceLine = `base ${token.symbol}: ${amount} ($${usdValue.toFixed(2)})`;

      if (!seenBalances.has(balanceLine)) {
        seenBalances.add(balanceLine);
        lines.push(balanceLine);
      }
    }
  };

  // Process Base chain balances
  const baseBalances = data.groupedBalances['base'] || [];
  baseBalances.forEach(processBalance);

  // Process Base chain fungible tokens
  data.fungibles
    .filter(token => token.chain === 'base')
    .forEach(processBalance);

  if (lines.length === 0) {
    lines.push('No balances found');
  }

  const response = lines.join('\n');
  console.log('Formatted response:', response);
  return response;
}

export const getNativeErc20BalanceAction: Action = {
  name: 'getNativeErc20Balance',
  description: 'Get native and ERC20 token balances for the agent account',
  handler: async (runtime: IAgentRuntime & { character: ExtendedCharacter }) => {
    try {
      const account = runtime.character.onchainAgent?.account;
      if (!account) {
        return {
          success: false,
          error: 'No onchain agent account configured'
        };
      }

      // Use public endpoint for balance fetching
      const response = await fetch(
        `https://ensurance.app/api/simplehash/native-erc20?address=${account.accountAddress}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data: SimpleHashBalance = await response.json();
      const formattedResponse = formatBalanceResponse(data);

      return {
        success: true,
        data: {
          balances: data,
          formatted: formattedResponse,
          address: account.accountAddress
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  validate: async (runtime: IAgentRuntime & { character: ExtendedCharacter }) => {
    // Only check if account is configured since API is public
    return !!runtime.character.onchainAgent?.account;
  },

  similes: [
    'GET_TOKEN_BALANCE',
    'CHECK_TOKEN_BALANCE',
    'SHOW_TOKENS',
    'VIEW_TOKENS',
    'CHECK_WALLET',
    'WALLET_BALANCE',
    'ACCOUNT_BALANCE',
    'VIEW_WALLET',
    'SHOW_WALLET'
  ],

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
          action: 'getNativeErc20Balance'
        }
      }
    ],
    [
      {
        user: 'user',
        content: { text: 'Show me my wallet balance' }
      },
      {
        user: 'agent',
        content: {
          text: 'Here are your token balances:\nNo balances found',
          action: 'getNativeErc20Balance'
        }
      }
    ]
  ]
};