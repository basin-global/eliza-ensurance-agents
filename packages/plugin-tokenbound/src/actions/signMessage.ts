import { type TokenboundWalletProvider } from "../providers/wallet";
import { getWalletProvider } from "../providers/wallet";
import { type SignableMessage, toHex } from "viem";
import type { SignMessageParams } from "../types";

export class SignMessageAction {
    constructor(private walletProvider: TokenboundWalletProvider) {}

    async sign(params: SignMessageParams): Promise<`0x${string}`> {
        const walletClient = this.walletProvider.getWalletClient();

        try {
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
        } catch (error) {
            throw new Error(`Message signing failed: ${error.message}`);
        }
    }
}

export const signMessageAction = {
    name: "TBA_SIGN_MESSAGE",
    description: "Sign message with TBA",
    handler: async (runtime, message, state, options) => {
        const walletProvider = getWalletProvider(runtime);
        const action = new SignMessageAction(walletProvider);
        return action.sign(options);
    },
    validate: async (runtime) => {
        const tbaAddress = runtime.getSetting("TBA_ADDRESS");
        const privateKey = runtime.getSetting("TBA_PRIVATE_KEY");
        return !!(tbaAddress && privateKey);
    },
    similes: ["SIGN", "SIGN_MESSAGE", "MESSAGE_SIGN"],
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Sign this message: Hello World"
                }
            }
        ]
    ]
};