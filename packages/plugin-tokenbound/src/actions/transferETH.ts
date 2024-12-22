import { parseEther } from "viem";
import type { TokenboundWalletProvider } from "../providers/wallet";
import type { Transaction, TransferETHParams } from "../types";

export class TransferETHAction {
    constructor(private walletProvider: TokenboundWalletProvider) {}

    async transfer(params: TransferETHParams): Promise<Transaction> {
        const walletClient = this.walletProvider.getWalletClient();
        const value = parseEther(params.amount.toString());

        try {
            const hash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: params.recipientAddress,
                value,
                chain: this.walletProvider.getChain()
            });

            return {
                hash,
                from: params.account,
                to: params.recipientAddress,
                value,
                chainId: params.chainId
            };
        } catch (error) {
            throw new Error(`ETH transfer failed: ${error.message}`);
        }
    }
}

export const transferETHAction = {
    name: "TBA_TRANSFER_ETH",
    description: "Transfer ETH from TBA",
    handler: async (runtime, message, state, options) => {
        const walletProvider = getWalletProvider(runtime.getSetting);
        const action = new TransferETHAction(walletProvider);
        return action.transfer(options);
    },
    template: `Given the recent messages, extract:
    - Amount in ETH (decimal form e.g. 0.01)
    - Recipient address
    - Chain ID (optional)

    Respond with JSON:
    {
        "account": "<tba_address>",
        "amount": number,
        "recipientAddress": string,
        "chainId": number | null
    }`,
    validate: async (runtime) => {
        const tbaAddress = runtime.getSetting("TBA_ADDRESS");
        const privateKey = runtime.getSetting("TBA_PRIVATE_KEY");
        return !!(tbaAddress && privateKey);
    }
};