import { type UniversalSignableMessage } from "../types";
import { type TokenboundWalletProvider } from "../providers/wallet";
import { getWalletProvider } from "../providers/wallet";

export class SignMessageAction {
    constructor(private walletProvider: TokenboundWalletProvider) {}

    async sign(params: SignMessageParams): Promise<`0x${string}`> {
        const walletClient = this.walletProvider.getWalletClient();

        try {
            const signature = await walletClient.signMessage({
                account: walletClient.account,
                message: params.message
            });

            return signature;
        } catch (error) {
            throw new Error(`Message signing failed: ${error.message}`);
        }
    }
}

export const signMessageAction = {
    name: "TBA_SIGN_MESSAGE",
    description: "Sign a message from TBA",
    handler: async (runtime, message, state, options) => {
        const walletProvider = getWalletProvider(runtime.getSetting);
        const action = new SignMessageAction(walletProvider);
        return action.sign(options);
    },
    template: `Given the recent messages, extract:
    - Message to sign (string or bytes)

    Respond with JSON:
    {
        "account": "<tba_address>",
        "message": string | { raw: Uint8Array }
    }`,
    validate: async (runtime) => {
        const tbaAddress = runtime.getSetting("TBA_ADDRESS");
        const privateKey = runtime.getSetting("TBA_PRIVATE_KEY");
        return !!(tbaAddress && privateKey);
    }
};