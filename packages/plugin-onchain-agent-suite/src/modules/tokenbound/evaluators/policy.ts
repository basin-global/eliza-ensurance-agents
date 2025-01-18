import { Evaluator, Memory, IAgentRuntime } from '@elizaos/core';
import type { TokenboundAccount } from '../types';

interface TransactionPolicy {
  // Core protection
  cannotTransferOwnNFT: boolean;

  // Basic limits (very lenient for testing)
  maxTokenAmountPerTx: {
    [tokenSymbol: string]: number;
  };
}

interface PolicyViolation {
  rule: string;
  details: string;
}

export const policyEvaluator: Evaluator = {
  name: "TOKENBOUND_POLICY_EVAL",
  description: "Evaluates if transactions comply with basic security policies",
  similes: ["POLICY_CHECK", "TRANSACTION_POLICY", "TX_RULES"],
  examples: [
    {
      context: "Character attempts to transfer their identity NFT",
      messages: [{
        user: "agent",
        content: {
          text: "Transfer my NFT to 0x123...",
          action: "TBA_TRANSFER_ERC721",
          nft: {
            contract: "0xNFT...",
            tokenId: "1"
          }
        }
      }],
      outcome: "Violation: Cannot transfer the NFT that defines character's identity"
    }
  ],

  validate: async (runtime: IAgentRuntime, memory: Memory) => {
    return true; // Always validate - we'll check specifics in handler
  },

  handler: async (runtime: IAgentRuntime, memory: Memory) => {
    try {
      const content = memory.content;
      if (!content?.action?.includes("TRANSFER")) {
        return null;
      }

      // Very lenient policy for testing
      const policy: TransactionPolicy = {
        cannotTransferOwnNFT: true,
        maxTokenAmountPerTx: {
          "ENSURE": 100000,
          "ETH": 100
        }
      };

      const violations: PolicyViolation[] = [];

      // Core protection: Check NFT transfer restrictions
      if (content.action === "TBA_TRANSFER_ERC721" &&
          typeof content.nft === 'object' && content.nft !== null) {
        const nft = content.nft as { contract: string; tokenId: string };

        // Get account info from character's tokenbound config
        const tokenboundConfig = runtime.character.settings?.chains?.evm?.[0]?.account;

        if (policy.cannotTransferOwnNFT &&
            tokenboundConfig?.tokenContract &&
            nft.contract === tokenboundConfig.tokenContract &&
            nft.tokenId === tokenboundConfig.tokenId) {
          violations.push({
            rule: "CANNOT_TRANSFER_OWN_NFT",
            details: "Cannot transfer the NFT that defines this character's identity"
          });
        }
      }

      // Basic amount check
      if (typeof content.amount === 'number' &&
          typeof content.token === 'string') {
        const token = content.token.toUpperCase();
        const maxPerTx = policy.maxTokenAmountPerTx[token];

        if (maxPerTx && content.amount > maxPerTx) {
          violations.push({
            rule: "MAX_AMOUNT_PER_TX",
            details: `Cannot send more than ${maxPerTx} ${token} in a single transaction`
          });
        }
      }

      return {
        allowed: violations.length === 0,
        violations,
        policy
      };

    } catch (error) {
      console.error("Policy evaluation failed:", error);
      return null;
    }
  }
};