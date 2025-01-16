// Core types aligned with tokenbound SDK
export interface TokenboundAccount {
  chainId: number;           // Standard chains (e.g. 8453 for Base)
                            // For custom chains, we'll handle in the tokenbound module
  tokenContract: string;     // NFT contract address
  tokenId: string;          // NFT token ID
  accountAddress: string;    // TBA address (`account in SDK)
  expectedOwner?: string;   // Expected NFT owner address (for validation)
}