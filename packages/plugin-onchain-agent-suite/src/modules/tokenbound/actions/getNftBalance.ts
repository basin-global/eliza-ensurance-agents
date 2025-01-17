import { TokenboundAction, TokenboundAccount } from '../types';
import type { Address } from 'viem';

// Will update these interfaces when we have the API details
interface NFTBalance {
  contract: string;
  tokenId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  collection?: {
    name: string;
    symbol?: string;
  };
  // Will add more fields based on API response
}

export const getNftBalanceAction: TokenboundAction = {
  name: 'TBA_GET_NFT_BALANCE',
  description: 'Get NFT balances (ERC721 and ERC1155) for the Tokenbound Account',

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

      // Will update with correct API endpoint
      const response = await fetch(
        `https://ensitus.xyz/api/simplehash/nft?address=${account.accountAddress}`,
        {
          headers: { 'Authorization': `Bearer ${simpleHashKey}` }
        }
      );

      if (!response.ok) {
        throw new Error(`SimpleHash API error: ${response.statusText}`);
      }

      const data = await response.json();
      const nfts = formatNFTs(data);

      if (callback) {
        callback({
          text: nfts.join('\n'),
          content: {
            success: true,
            nfts: data,
            formatted: nfts
          }
        });
      }
      return true;

    } catch (error) {
      if (callback) {
        callback({
          text: `Error getting NFT balances: ${error.message}`,
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

  similes: ['GET_NFTS', 'CHECK_NFTS', 'SHOW_NFTS', 'VIEW_NFTS', 'LIST_NFTS'],

  examples: [
    [
      {
        user: 'user',
        content: { text: 'What NFTs do I have?' }
      },
      {
        user: 'agent',
        content: {
          text: 'Here are your NFTs:\nCryptoKitty #123 from CryptoKitties\nBored Ape #456 from BAYC',
          action: 'TBA_GET_NFT_BALANCE'
        }
      }
    ]
  ]
};

// Placeholder - will update when we have the API response format
function formatNFTs(data: any): string[] {
  return ['NFT balance feature coming soon'];
}