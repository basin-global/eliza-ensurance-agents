import { Action, IAgentRuntime, Memory, State, HandlerCallback } from '@elizaos/core';
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

export const getNativeErc20BalanceAction: Action = {
  name: 'getNativeErc20Balance',
  description: 'Get native and ERC20 token balances for the agent account',
  handler: async (runtime: IAgentRuntime & { character: ExtendedCharacter }, message: Memory, state: State, options: any, callback: HandlerCallback) => {
    try {
      const account = runtime.character.onchainAgent?.account;
      if (!account) {
        callback({
          text: 'I do not have a wallet configured.',
          content: {
            success: false,
            error: 'No onchain agent account configured'
          }
        }, []);
        return;
      }

      // Use public endpoint for balance fetching
      const response = await fetch(
        `https://ensurance.app/api/simplehash/native-erc20?address=${account.accountAddress}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data: SimpleHashBalance = await response.json();

      // Pass raw data to LLM for natural language formatting
      callback({
        text: '', // Let the LLM format the response based on the raw data
        content: {
          success: true,
          balances: data,
          address: account.accountAddress,
          rawBalances: Object.entries(data.groupedBalances).flatMap(([chain, tokens]) =>
            tokens.map(token => ({
              chain,
              symbol: token.symbol,
              amount: Number(token.queried_wallet_balances?.[0]?.quantity_string || '0') / Math.pow(10, token.decimals),
              usdValue: Number(token.queried_wallet_balances?.[0]?.value_usd_string || '0')
            }))
          ).filter(b => b.amount > 0)
        }
      }, []);

    } catch (error) {
      console.error('Balance check failed:', error);
      callback({
        text: 'Sorry, I encountered an error checking my balances.',
        content: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }, []);
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
          text: "I have several tokens in my wallet: about 1.5 ETH (worth around $3,000), 100 USDC ($100), and a small amount of ENSURE tokens.",
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
          text: "Let me check your balances... I see you have:\n- ETH: 1.5 (approximately $3,000)\n- USDC: 100 ($100)\n- ENSURE: 5,000 tokens",
          action: 'getNativeErc20Balance'
        }
      }
    ],
    [
      {
        user: 'user',
        content: { text: 'How much ETH do I have?' }
      },
      {
        user: 'agent',
        content: {
          text: "You currently have 1.5 ETH in your wallet, which is worth approximately $3,000 at current prices.",
          action: 'getNativeErc20Balance'
        }
      }
    ],
    [
      {
        user: 'user',
        content: { text: 'What is my total portfolio value?' }
      },
      {
        user: 'agent',
        content: {
          text: "Your total portfolio value is approximately $3,100, consisting mainly of ETH ($3,000) and some USDC ($100).",
          action: 'getNativeErc20Balance'
        }
      }
    ]
  ]
};