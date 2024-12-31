import { type Action } from "@elizaos/core";
import type { IAgentRuntime, HandlerCallback } from "@elizaos/core";

export const transferETHAction: Action = {
    name: "TBA_TRANSFER_ETH",
    description: "Transfer ETH from TBA (Coming Soon - Currently Disabled)",
    handler: async (runtime, message, state, options, callback) => {
        if (callback) {
            callback({
                text: "Token transfers are currently disabled for security. This feature will be enabled after security audits are complete.",
                content: {
                    error: "FEATURE_DISABLED",
                    status: "pending_security_audit"
                }
            });
        }
        return false;
    },
    validate: async (runtime) => {
        // Always return false while disabled
        return false;
    },
    similes: ["SEND_ETH", "ETH_TRANSFER", "MOVE_ETH"],
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                }
            },
            {
                user: "agent",
                content: {
                    text: "Token transfers are currently disabled for security. This feature will be enabled after security audits are complete.",
                    action: "TBA_TRANSFER_ETH",
                    error: "FEATURE_DISABLED"
                }
            }
        ]
    ]
};