import { Action, IAgentRuntime, Memory, State, HandlerCallback, composeContext, generateText, ModelClass } from '@elizaos/core';
import { ExtendedCharacter } from '../../../types';
import { TokenboundAccount } from '../types';
import type { Address } from 'viem';

// Template for balance responses
const getBalanceTemplate = (requiresCurrentBalances: boolean) => `
# Knowledge
{{knowledge}}

About {{agentName}}:
{{bio}}
{{lore}}

# Context
Current wallet balances:
{{balances}}

# Query Context
Original query: {{query}}
Requires current balances: ${requiresCurrentBalances}

# Task
Respond naturally to the balance query. Keep responses:
- Professional yet personable
- Accurate with numbers
- Focused on relevant information
- In character but without narrating actions
${requiresCurrentBalances ? '- Use exact current balances for precise reporting' : '- Approximate values are acceptable for general overview'}

Remember this is financial information - be precise with numbers while maintaining your personality.`;

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
  groupedBalances: Record<string, TokenBalance[]>;
  ethPrice: number | null;
}

export const getNativeErc20BalanceAction: Action = {
  name: 'getNativeErc20Balance',
  description: 'Get native and ERC20 token balances for the agent account',
  handler: async (runtime: IAgentRuntime & { character: ExtendedCharacter }, message: Memory, state: State, options: any, callback: HandlerCallback) => {
    try {
      console.log('Starting getNativeErc20Balance handler');

      // Determine if we need current balances based on query
      const requiresCurrentBalances = message.content.text.toLowerCase().match(
        /(exact|current|precise|right now|exactly|balance|how much)/
      ) !== null;

      console.log('Query requires current balances:', requiresCurrentBalances);

      const account = runtime.character.onchainAgent?.account;
      if (!account) {
        console.log('No account configured');
        callback({
          text: 'I do not have a wallet configured.',
          content: {
            success: false,
            error: 'No onchain agent account configured'
          }
        }, []);
        return;
      }

      console.log('Fetching balances for address:', account.accountAddress);
      const response = await fetch(
        `https://ensurance.app/api/simplehash/native-erc20?address=${account.accountAddress}`,
        {
          headers: {
            'Cache-Control': requiresCurrentBalances ? 'no-cache' : 'max-age=300' // 5 min cache for non-exact queries
          }
        }
      );

      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(`API error: ${response.statusText}`);
      }

      console.log('Got API response, parsing JSON');
      const data = await response.json() as SimpleHashBalance;
      console.log('Parsed API response:', JSON.stringify(data, null, 2));

      // Format raw balances for template
      console.log('Formatting balances');
      const formattedBalances = Object.entries(data.groupedBalances)
        .flatMap(([chain, tokens]) =>
          tokens.map(token => ({
            chain,
            symbol: token.symbol,
            amount: Number(token.queried_wallet_balances?.[0]?.quantity_string || '0') / Math.pow(10, token.decimals),
            usdValue: Number(token.queried_wallet_balances?.[0]?.value_usd_string || '0')
          }))
        )
        .filter(b => b.amount > 0);
      console.log('Formatted balances:', JSON.stringify(formattedBalances, null, 2));

      // Generate response using template
      console.log('Generating response');
      const context = composeContext({
        state,
        template: getBalanceTemplate(requiresCurrentBalances)
          .replace('{{balances}}', JSON.stringify(formattedBalances, null, 2))
          .replace('{{query}}', message.content.text)
      });

      const responseText = await generateText({
        runtime,
        context,
        modelClass: ModelClass.SMALL
      });

      console.log('Sending callback with response');
      callback({
        text: responseText,
        content: {
          success: true,
          balances: data,
          address: account.accountAddress,
          formattedBalances,
          isCurrentBalance: requiresCurrentBalances
        }
      }, []);

    } catch (error) {
      console.error('Balance check failed:', error);
      const errorText = error instanceof Error ? error.message : 'Unknown error';
      callback({
        text: `I encountered an error checking the balances: ${errorText}`,
        content: {
          success: false,
          error: errorText
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