import { Action, IAgentRuntime, Memory, State, HandlerCallback, composeContext, generateText, ModelClass } from '@elizaos/core';
import { ExtendedCharacter } from '../../../types';
import { TokenboundAccount } from '../types';
import type { Address } from 'viem';

// Template for NFT responses
const getNftTemplate = (requiresCurrentData: boolean) => `
# Knowledge
{{knowledge}}

About {{agentName}}:
{{bio}}
{{lore}}

# Context
Query: {{query}}
Requires current data: ${requiresCurrentData}
Note: This is data from my tokenbound wallet (I=agent, you=user)

# NFT Data
{{nfts}}

# Task
Respond about the NFT data above:
- Use exact NFT data (token IDs, names, quantities)
- No assumptions about NFTs not in the data
${requiresCurrentData ? '- Report current exact holdings' : '- General overview is acceptable'}

Note: These are verified on-chain NFTs from the provided data.`;

interface NFTBalance {
  nft_id: string;
  chain: string;
  contract_address: string;
  token_id: string;
  name: string;
  description: string;
  contract: {
    type: string;
    name: string;
    symbol: string | null;
  };
  collection: {
    name: string;
    description: string;
  };
  queried_wallet_balances: Array<{
    address: string;
    quantity: number;
    quantity_string: string;
    first_acquired_date: string;
    last_acquired_date: string;
  }>;
}

interface SimpleHashNFTResponse {
  nfts: NFTBalance[];
  next_cursor: string | null;
  next: string | null;
  previous: string | null;
}

// Helper function to simplify NFT data for LLM consumption
function simplifyNFTData(data: SimpleHashNFTResponse, accountAddress: string) {
  return data.nfts.map(nft => {
    const balance = nft.queried_wallet_balances.find(b => b.address.toLowerCase() === accountAddress.toLowerCase());
    return {
      tokenId: nft.token_id,
      name: nft.name,
      description: nft.description,
      collection: {
        name: nft.collection.name,
        description: nft.collection.description
      },
      chain: nft.chain,
      contractAddress: nft.contract_address,
      contractType: nft.contract.type,
      quantity: balance?.quantity || 0,
      firstAcquired: balance?.first_acquired_date,
      lastAcquired: balance?.last_acquired_date
    };
  }).filter(nft => nft.quantity > 0);
}

export const getNftBalanceAction: Action = {
  name: 'getNftBalance',
  description: 'Get NFT (ERC721 and ERC1155) balances for the agent account',
  handler: async (runtime: IAgentRuntime & { character: ExtendedCharacter }, message: Memory, state: State, options: any, callback: HandlerCallback) => {
    try {
      console.log('Starting getNftBalance handler');

      // Determine if we need current data based on query
      const requiresCurrentData = message.content.text.toLowerCase().match(
        /(exact|current|precise|right now|exactly|list|show|all|how many)/
      ) !== null;

      console.log('Query requires current NFT data:', requiresCurrentData);

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

      console.log('Fetching NFTs for address:', account.accountAddress);
      const response = await fetch(
        `https://ensurance.app/api/simplehash/nft?address=${account.accountAddress}`,
        {
          headers: {
            'Cache-Control': requiresCurrentData ? 'no-cache' : 'max-age=300' // 5 min cache for non-exact queries
          }
        }
      );

      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(`API error: ${response.statusText}`);
      }

      console.log('Got API response, parsing JSON');
      const data = await response.json() as SimpleHashNFTResponse;
      console.log(`Parsed API response: Found ${data.nfts.length} NFTs`);

      console.log('Simplifying NFT data');
      const simplifiedNFTs = simplifyNFTData(data, account.accountAddress);
      console.log(`Simplified NFT data: Found ${simplifiedNFTs.length} NFTs for this account`);

      // Generate response using template
      console.log('Generating response');
      const context = composeContext({
        state,
        template: getNftTemplate(requiresCurrentData)
          .replace('{{nfts}}', JSON.stringify(simplifiedNFTs, null, 2))
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
          address: account.accountAddress,
          nfts: simplifiedNFTs,
          isCurrentData: requiresCurrentData
        }
      }, []);

    } catch (error) {
      console.error('NFT balance check failed:', error);
      const errorText = error instanceof Error ? error.message : 'Unknown error';
      callback({
        text: `I encountered an error checking the NFT balances: ${errorText}`,
        content: {
          success: false,
          error: errorText
        }
      }, []);
    }
  },

  validate: async (runtime: IAgentRuntime & { character: ExtendedCharacter }) => {
    return !!runtime.character.onchainAgent?.account;
  },

  similes: [
    'GET_NFT_COLLECTION',
    'CHECK_NFT_COLLECTION',
    'SHOW_NFT_COLLECTION',
    'VIEW_NFT_COLLECTION',
    'LIST_NFT_COLLECTION',
    'CHECK_NFT_HOLDINGS',
    'VIEW_NFT_HOLDINGS',
    'SHOW_NFT_HOLDINGS',
    'OWN_NFT_COLLECTION',
    'HAVE_NFT_COLLECTION',
    'MY_NFT_COLLECTION',
    'YOUR_NFT_COLLECTION'
  ],

  examples: [
    [
      {
        user: 'user',
        content: { text: 'What NFTs do you have?' }
      },
      {
        user: 'agent',
        content: {
          text: "Let me check my NFT collection. I'll share what I currently hold.",
          action: 'getNftBalance'
        }
      }
    ],
    [
      {
        user: 'user',
        content: { text: 'Show me your NFT collection' }
      },
      {
        user: 'agent',
        content: {
          text: "I'll share my current NFT holdings with you. Let me check my collection.",
          action: 'getNftBalance'
        }
      }
    ],
    [
      {
        user: 'user',
        content: { text: 'How many NFTs do you own?' }
      },
      {
        user: 'agent',
        content: {
          text: "Let me check my NFT quantities. I'll tell you exactly what I have.",
          action: 'getNftBalance'
        }
      }
    ],
    [
      {
        user: 'user',
        content: { text: 'Tell me about your NFTs' }
      },
      {
        user: 'agent',
        content: {
          text: "I'll give you an overview of all my NFT holdings.",
          action: 'getNftBalance'
        }
      }
    ]
  ]
};