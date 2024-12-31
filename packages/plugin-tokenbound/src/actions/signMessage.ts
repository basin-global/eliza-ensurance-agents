import { type TokenboundWalletProvider } from "../providers/wallet";
import { getWalletProvider } from "../providers/wallet";
import { type SignableMessage, toHex, type WalletClient } from "viem";
import type { SignMessageParams, TokenboundCharacter } from "../types";
import { type Action } from "@elizaos/core";

export class SignMessageAction {
    constructor(private walletProvider: TokenboundWalletProvider) {}

    async sign(params: SignMessageParams): Promise<`0x${string}`> {
        try {
            const client = await this.walletProvider.getWalletClient();
            const walletClient = client as WalletClient;

            let message: SignableMessage;
            if (typeof params.message === 'string') {
                message = params.message;
            } else if ('raw' in params.message) {
                message = toHex(params.message.raw);
            } else {
                message = toHex(params.message);
            }

            const signature = await walletClient.signMessage({
                account: walletClient.account,
                message
            });

            return signature;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            throw new Error(`Message signing failed: ${error.message}`);
        }
    }
}

export const signMessageAction: Action = {
    name: "TBA_SIGN_MESSAGE",
    description: "Sign a message with the Tokenbound Account",
    handler: async (runtime, message, state, options, callback) => {
        try {
            if (!options?.message) {
                throw new Error("MESSAGE_MISSING");
            }

            const walletProvider = getWalletProvider(runtime);
            const action = new SignMessageAction(walletProvider);
            const signature = await action.sign(options);

            if (callback) {
                callback({
                    text: `Message signed successfully. Signature: ${signature}`,
                    content: {
                        success: true,
                        signature,
                        message: options.message
                    }
                });
            }
            return true;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error('Message signing failed:', error);

            if (callback) {
                callback({
                    text: `Failed to sign message: ${error.message}`,
                    content: {
                        error: error.message,
                        success: false
                    }
                });
            }
            return false;
        }
    },
    validate: async (runtime) => {
        const character = runtime.character as TokenboundCharacter;
        const tbConfig = character.tokenbound;
        return !!(tbConfig?.address && tbConfig?.owner?.key);
    },
    similes: ["SIGN", "SIGN_MESSAGE", "MESSAGE_SIGN"],
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Sign this message: Hello World"
                }
            },
            {
                user: "agent",
                content: {
                    text: "Message signed successfully. Signature: 0x...",
                    action: "TBA_SIGN_MESSAGE"
                }
            }
        ]
    ]
};