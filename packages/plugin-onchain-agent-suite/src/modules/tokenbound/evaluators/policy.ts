import { Evaluator } from '@elizaos/core';
import type { TokenboundAccount } from '../types';

interface TransactionPolicy {
  // Character alignment
  requirePersonalityAlignment: boolean;  // Whether to check transaction against character traits

  // NFT policies
  cannotTransferOwnNFT: boolean;  // Prevent transferring character's own NFT

  // Transaction frequency limits
  maxDailyTxPerRecipient: number;  // Max transactions per day to same address
  recipientCooldownHours: number;   // Hours between transactions to same address

  // Amount limits
  maxTokenAmountPerTx: {
    [tokenSymbol: string]: number;  // e.g. {"ENSURE": 1000}
  };
  maxTokenAmountPerDay: {
    [tokenSymbol: string]: number;  // e.g. {"ENSURE": 5000}
  };
}

interface PolicyViolation {
  rule: string;
  details: string;
}

export const policyEvaluator: Evaluator = {
  name: "TOKENBOUND_POLICY_EVAL",
  description: "Evaluates if transactions comply with character policies",
  similes: ["POLICY_CHECK", "TRANSACTION_POLICY", "TX_RULES"],

  validate: async (runtime: any, memory: any) => {
    const character = runtime.character;
    return !!character?.onchainAgent?.account;
  },

  handler: async (runtime: any, memory: any) => {
    try {
      const content = memory.content;
      if (!content?.action?.includes("TRANSFER")) {
        return null;
      }

      const character = runtime.character;
      const account = character.onchainAgent?.account as TokenboundAccount;

      // Default policy - can be made configurable later
      const policy: TransactionPolicy = {
        requirePersonalityAlignment: true,
        cannotTransferOwnNFT: true,
        maxDailyTxPerRecipient: 2,
        recipientCooldownHours: 12,
        maxTokenAmountPerTx: {
          "ENSURE": 1000,
          "ETH": 1
        },
        maxTokenAmountPerDay: {
          "ENSURE": 5000,
          "ETH": 5
        }
      };

      const violations: PolicyViolation[] = [];

      // Check personality alignment first
      if (policy.requirePersonalityAlignment) {
        // Let the LLM evaluate if this transaction aligns with character traits
        const evaluation = await runtime.evaluateWithLLM({
          task: "EVALUATE_TRANSACTION_ALIGNMENT",
          context: {
            transaction: content,
            bio: character.bio,
            lore: character.lore,
            purpose: character.onchainAgent?.purpose,
            values: character.onchainAgent?.values,
            relationships: character.onchainAgent?.relationships
          },
          instruction: "Based on the character's traits (bio, lore, purpose, values, relationships), evaluate if this transaction aligns with their personality and goals. Return true if aligned, false if misaligned."
        });

        if (!evaluation.aligned) {
          violations.push({
            rule: "PERSONALITY_ALIGNMENT",
            details: evaluation.reason || "Transaction does not align with character traits and values"
          });
        }
      }

      // Check NFT transfer restrictions
      if (content.action === "TBA_TRANSFER_ERC721" && content.nft) {
        if (policy.cannotTransferOwnNFT &&
            content.nft.contract === account.tokenContract &&
            content.nft.tokenId === account.tokenId) {
          violations.push({
            rule: "CANNOT_TRANSFER_OWN_NFT",
            details: "Cannot transfer the NFT that defines this character's identity"
          });
        }
      }

      // Check recipient frequency limits
      if (content.recipient && policy.maxDailyTxPerRecipient) {
        const memoryManager = await runtime.getMemoryManager(memory.roomId);
        if (memoryManager) {
          const recentTxs = await memoryManager.getMemories({
            roomId: memory.roomId,
            start: Date.now() - 24 * 60 * 60 * 1000,
            end: Date.now()
          });

          const recipientTxs = recentTxs.filter(tx =>
            tx.content?.recipient === content.recipient
          );

          if (recipientTxs.length >= policy.maxDailyTxPerRecipient) {
            violations.push({
              rule: "MAX_DAILY_TX_PER_RECIPIENT",
              details: `Cannot send more than ${policy.maxDailyTxPerRecipient} transactions per day to the same recipient`
            });
          }
        }
      }

      // Check amount limits
      if (typeof content.amount === 'number' && content.token) {
        const token = content.token.toUpperCase();
        const maxPerTx = policy.maxTokenAmountPerTx[token];

        if (maxPerTx && content.amount > maxPerTx) {
          violations.push({
            rule: "MAX_AMOUNT_PER_TX",
            details: `Cannot send more than ${maxPerTx} ${token} in a single transaction`
          });
        }

        // Check daily amount
        const memoryManager = await runtime.getMemoryManager(memory.roomId);
        if (memoryManager) {
          const dailyTxs = await memoryManager.getMemories({
            roomId: memory.roomId,
            start: Date.now() - 24 * 60 * 60 * 1000,
            end: Date.now()
          });

          const tokenTxs = dailyTxs.filter(tx =>
            tx.content?.token?.toUpperCase() === token
          );

          const dailyTotal = tokenTxs.reduce((sum, tx) =>
            sum + (tx.content?.amount || 0), 0
          );

          const maxPerDay = policy.maxTokenAmountPerDay[token];
          if (maxPerDay && (dailyTotal + content.amount) > maxPerDay) {
            violations.push({
              rule: "MAX_AMOUNT_PER_DAY",
              details: `Cannot exceed ${maxPerDay} ${token} in total transactions per day`
            });
          }
        }
      }

      if (violations.length > 0) {
        return {
          allowed: false,
          violations,
          policy
        };
      }

      return {
        allowed: true,
        policy
      };

    } catch (error) {
      console.error("Policy evaluation failed:", error);
      return null;
    }
  }
};