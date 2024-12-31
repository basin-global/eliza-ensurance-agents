import { type Evaluator, type IAgentRuntime, type Memory } from "@elizaos/core";
import type { TokenboundCharacter } from "../types";
import type { TokenBalance } from "../actions/getBalance";

interface BalanceEvaluation {
    address: string;
    chain: string;
    lastChecked: number;
    balances: {
        symbol: string;
        amount: string;
        usdValue: number;
    }[];
}

export const tokenboundBalanceEvaluator: Evaluator = {
    name: "TOKENBOUND_BALANCE_EVAL",
    description: "Evaluates and tracks token balance changes",
    similes: ["TBA_BALANCE_EVAL", "WALLET_BALANCE_EVAL"],

    validate: async (runtime: IAgentRuntime, memory: Memory) => {
        const character = runtime.character as TokenboundCharacter;
        return !!character.tokenbound?.address;
    },

    handler: async (runtime: IAgentRuntime, memory: Memory) => {
        try {
            // Only evaluate TBA_GET_BALANCE action results
            if (memory.content?.action !== "TBA_GET_BALANCE" || !memory.content?.success) {
                return null;
            }

            const character = runtime.character as TokenboundCharacter;
            if (!character.tokenbound?.address) return null;

            const evaluation: BalanceEvaluation = {
                address: character.tokenbound.address,
                chain: character.tokenbound.chain || "base",
                lastChecked: Date.now(),
                balances: (memory.content.balances as TokenBalance[]).map(b => ({
                    symbol: b.symbol,
                    amount: b.total_quantity_string,
                    usdValue: b.total_value_usd_cents / 100
                }))
            };

            // Store evaluation in memory
            const memoryManager = await runtime.getMemoryManager();
            if (memoryManager) {
                await memoryManager.createMemory({
                    id: `balance_eval_${memory.id}`,
                    content: {
                        text: `Balance evaluation for ${character.tokenbound.address}`,
                        evaluation
                    },
                    roomId: memory.roomId,
                    userId: memory.userId,
                    agentId: runtime.agentId
                });
            }

            return evaluation;
        } catch (error) {
            console.error("Balance evaluation failed:", error);
            return null;
        }
    },

    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Check my wallet balance",
                    action: "TBA_GET_BALANCE"
                }
            }
        ]
    ]
};