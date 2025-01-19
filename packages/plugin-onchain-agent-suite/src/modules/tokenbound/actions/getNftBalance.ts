import { Action, IAgentRuntime, Memory, State, HandlerCallback } from '@elizaos/core';
import { ExtendedCharacter } from '../../../types';
import { TokenboundAccount } from '../types';
import type { Address } from 'viem';

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
      name: nft.name,
      description: nft.description,
      collection: {
        name: nft.collection.name,
        description: nft.collection.description
      },
      chain: nft.chain,
      type: nft.contract.type,
      quantity: balance?.quantity || 0
    };
  }).filter(nft => nft.quantity > 0);
}

export const getNftBalanceAction: Action = {
  name: 'getNftBalance',
  description: 'Get NFT (ERC721 and ERC1155) balances for the agent account',
  handler: async (runtime: IAgentRuntime & { character: ExtendedCharacter }, message: Memory, state: State, options: any, callback: HandlerCallback) => {
    try {
      console.log('Starting getNftBalance handler');
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
      // Use public endpoint for NFT fetching
      const response = await fetch(
        `https://ensurance.app/api/simplehash/nft?address=${account.accountAddress}`
      );

      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(`API error: ${response.statusText}`);
      }

      console.log('Got API response, parsing JSON');
      const data: SimpleHashNFTResponse = await response.json();
      console.log(`Parsed API response: Found ${data.nfts.length} NFTs`);

      console.log('Simplifying NFT data');
      const simplifiedNFTs = simplifyNFTData(data, account.accountAddress);
      console.log(`Simplified NFT data: Found ${simplifiedNFTs.length} NFTs for this account`);

      console.log('Sending callback with NFT data');
      // Create a minimal summary counting NFTs by collection and type
      interface CollectionSummary {
        collection: string;
        chain: string;
        count: number;
        types: Set<string>;
      }

      const summary = simplifiedNFTs.reduce<Record<string, CollectionSummary>>((acc, nft) => {
        const key = `${nft.collection.name}`;
        if (!acc[key]) {
          acc[key] = {
            collection: nft.collection.name,
            chain: nft.chain,
            count: 0,
            types: new Set()
          };
        }
        acc[key].count++;
        acc[key].types.add(nft.type);
        return acc;
      }, {});

      // Convert summary to array and format types
      const collectionSummary = Object.values(summary).map(item => ({
        collection: item.collection,
        chain: item.chain,
        count: item.count,
        types: Array.from(item.types)
      }));

      callback({
        text: '',
        content: {
          success: true,
          address: account.accountAddress,
          rawNfts: simplifiedNFTs
        }
      }, []);

    } catch (error) {
      console.error('NFT balance check failed:', error);
      callback({
        text: 'Sorry, I encountered an error checking my NFT balances.',
        content: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
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
        content: { text: 'Do you own any NFTs?' }
      },
      {
        user: 'agent',
        content: {
          text: "Let me check my NFT collection. I have 1 ENSURANCE NFT (ERC721) from the ENSURANCE collection on Base, and 2 copies of a special edition NFT (ERC1155) from the same collection.",
          action: 'getNftBalance',
          rawNfts: []
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
          text: "I'll check my NFTs. I own several NFTs on Base: a unique ENSURANCE NFT (ERC721) and multiple copies of collectible items (ERC1155), all part of the ENSURANCE collection focused on ensuring ecosystems and species in perpetuity.",
          action: 'getNftBalance',
          rawNfts: []
        }
      }
    ],
    [
      {
        user: 'user',
        content: { text: 'How many copies of each NFT do you have?' }
      },
      {
        user: 'agent',
        content: {
          text: "Let me check my NFT quantities. In the ENSURANCE collection on Base, I have: 1 unique ENSURANCE NFT (ERC721 type, which means it's one-of-a-kind) and 2 copies of a special edition NFT (ERC1155 type, which allows multiple copies).",
          action: 'getNftBalance',
          rawNfts: []
        }
      }
    ]
  ]
};