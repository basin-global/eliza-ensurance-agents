import { Action, IAgentRuntime, Memory, State, HandlerCallback, composeContext, generateText, ModelClass } from '@elizaos/core';
import { ExtendedCharacter } from '../../../types';

// Template for balance responses
const getBalanceTemplate = `
# About {{agentName}}:
{{bio}}
{{purpose}}

# Current Wallet Data
Note: My wallet address ({{agentName}}'s) is {{accountAddress}}

Raw Token Balance Data:
{{formattedBalances}}

# Task: Respond about the wallet balances
Instructions:
- Stay in character as {{agentName}}
- Use ONLY the FRESH amounts / values from the API response
- Format numbers naturally - use appropriate decimals based on amount size and significance
- Be conversational and engaging
- Include total portfolio value if asked
- Mention specific tokens and their values
- Do not use technical jargon unless asked
- Do not reference cached or old data

Original Query: {{query}}

# Response Format:
Write a natural, conversational response about the balances. Format numbers appropriately based on their size and significance.`;

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

function formatBalances(groupedBalances: Record<string, TokenBalance[]>) {
  const balances = Object.entries(groupedBalances)
    .flatMap(([chain, tokens]) =>
      tokens.map(token => ({
        chain,
        symbol: token.symbol,
        amount: Number(token.queried_wallet_balances?.[0]?.quantity_string || '0') / Math.pow(10, token.decimals),
        usdValue: Number(token.queried_wallet_balances?.[0]?.value_usd_string || '0')
      }))
    )
    .filter(b => b.amount > 0);

  // Just pass the raw data as a structured string
  return balances.map(b =>
    `${b.symbol} (${b.chain}): amount=${b.amount}, usdValue=${b.usdValue}`
  ).join('\n');
}

export const getNativeErc20BalanceAction: Action = {
  name: 'getNativeErc20Balance',
  description: 'Get native and ERC20 token balances for the agent account',
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
        content: { text: 'What tokens do you have?' }
      },
      {
        user: 'agent',
        content: { text: '', action: 'getNativeErc20Balance' }
      }
    ],
    [
      {
        user: 'user',
        content: { text: 'Show me your balance' }
      },
      {
        user: 'agent',
        content: { text: '', action: 'getNativeErc20Balance' }
      }
    ],
    [
      {
        user: 'user',
        content: { text: 'How much ETH do you have?' }
      },
      {
        user: 'agent',
        content: { text: '', action: 'getNativeErc20Balance' }
      }
    ],
    [
      {
        user: 'user',
        content: { text: 'What is your total portfolio value?' }
      },
      {
        user: 'agent',
        content: { text: '', action: 'getNativeErc20Balance' }
      }
    ]
  ],
  validate: async (runtime: IAgentRuntime & { character: ExtendedCharacter }) => {
    // Only check if account is configured since API is public
    return !!runtime.character.onchainAgent?.account;
  },
  handler: async (runtime: IAgentRuntime & { character: ExtendedCharacter }, message: Memory, state: State, options: any, callback: HandlerCallback) => {
    try {
      console.log('Starting getNativeErc20Balance handler');

      const account = runtime.character.onchainAgent?.account;
      if (!account) {
        console.log('No account configured');
        await callback({
          text: 'I do not have a wallet configured.'
        });
        return;
      }

      console.log('Fetching balances for address:', account.accountAddress);
      const response = await fetch(
        `https://ensurance.app/api/simplehash/native-erc20?address=${account.accountAddress}`,
        {
          headers: {
            'Cache-Control': 'no-cache'  // Always get fresh data
          }
        }
      );

      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        await callback({
          text: `I encountered an error checking the balances: ${response.statusText}`
        });
        return;
      }

      console.log('Got API response, parsing JSON');
      const data = await response.json() as SimpleHashBalance;
      console.log('Parsed API response:', JSON.stringify(data, null, 2));

      // Format raw balances for template
      console.log('Formatting balances');
      const formattedBalances = formatBalances(data.groupedBalances);
      console.log('Formatted balances:', formattedBalances);

      // Generate response using template with proper state management
      console.log('Generating response');
      const context = composeContext({
        state: {
          ...state,
          chain: account.chainId,
          accountAddress: account.accountAddress,
          formattedBalances: formattedBalances,
          query: message.content.text
        },
        template: getBalanceTemplate
      });

      // Send response directly through callback
      await callback({
        text: await generateText({
          runtime,
          context,
          modelClass: ModelClass.SMALL
        })
      });
      return;

    } catch (error) {
      console.error('Balance check failed:', error);
      const errorText = error instanceof Error ? error.message : 'Unknown error';
      await callback({
        text: `I encountered an error checking the balances: ${errorText}`
      });
      return;
    }
  }
};