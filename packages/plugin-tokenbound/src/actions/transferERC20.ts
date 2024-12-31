import type { IAgentRuntime, HandlerCallback } from "@elizaos/core";

export const transferERC20Action = {
    name: "TBA_TRANSFER_ERC20",
    description: "Transfer ERC20 tokens from TBA (Coming Soon - Currently Disabled)",
    handler: async (
        runtime: IAgentRuntime,
        message,
        state,
        options,
        callback?: HandlerCallback
    ) => {
        if (callback) {
            callback({
                text: "Token sending capabilities are coming soon but are currently disabled for security reasons. Once implemented, it will include proper security controls and verification steps.",
                content: { error: "FEATURE_DISABLED" }
            });
        }
        return false;
    },
    validate: async (runtime) => {
        const tbConfig = runtime.character.tokenbound;
        if (!tbConfig?.address) return false;
        const key = runtime.getSetting(tbConfig.owner?.key ?? '');
        return !!(key);
    },
    similes: ["SEND_TOKEN", "TOKEN_TRANSFER", "TRANSFER_TOKEN"],
    examples: [[{
        user: "user",
        content: {
            text: "Send 10 USDC to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        }
    }]]
};