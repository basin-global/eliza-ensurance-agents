import { type Evaluator, type IAgentRuntime, type Memory } from "@elizaos/core";
import type { TokenboundCharacter, TransactionDetails } from "../types";

interface TransactionEvaluation {
    type: "SEND" | "SIGN" | "OTHER";
    status: "SUCCESS" | "FAILED" | "PENDING";
    timestamp: number;
    details: TransactionDetails;
}

export const tokenboundTransactionEvaluator: Evaluator = {
    name: "TOKENBOUND_TX_EVAL",
    description: "Evaluates tokenbound transaction activities",
    similes: ["TBA_TX_EVAL", "WALLET_TX_EVAL"],

    validate: async (runtime: IAgentRuntime, memory: Memory) => {
        const character = runtime.character as TokenboundCharacter;
        return !!character.tokenbound?.address;
    },

    handler: async (runtime: IAgentRuntime, memory: Memory) => {
        try {
            // Check if this is a transaction-related action
            const txActions = ["TBA_TRANSFER_ETH", "TBA_TRANSFER_ERC20", "TBA_SIGN_MESSAGE"];
            if (!txActions.includes(memory.content?.action)) {
                return null;
            }

            const evaluation: TransactionEvaluation = {
                type: memory.content.action.includes("TRANSFER") ? "SEND" : "SIGN",
                status: memory.content.success ? "SUCCESS" : "FAILED",
                timestamp: Date.now(),
                details: memory.content.transaction || { hash: "0x0" }
            };

            // Store in memory
            const memoryManager = await runtime.getMemoryManager();
            await memoryManager.createMemory({
                id: `tx_eval_${memory.id}`,
                content: { evaluation },
                roomId: memory.roomId,
                userId: memory.userId,
                agentId: runtime.agentId
            });

            return evaluation;
        } catch (error) {
            console.error("Transaction evaluation failed:", error);
            return null;
        }
    },

    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Send 0.1 ETH",
                    action: "TBA_TRANSFER_ETH"
                }
            }
        ]
    ]
};