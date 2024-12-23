import { parseEther } from "viem";
import type { TokenboundWalletProvider } from "../providers/wallet";
import { getWalletProvider } from "../providers/wallet";
import type { Transaction, TransferETHParams } from "../types";
import type { IAgentRuntime } from "@elizaos/core";

export class TransferETHAction {
    constructor(private walletProvider: TokenboundWalletProvider) {}

    async transfer(params: TransferETHParams): Promise<Transaction> {
        const walletClient = this.walletProvider.getWalletClient();

        try {
            const hash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: params.recipientAddress,
                value: parseEther(params.amount.toString()),
                chain: this.walletProvider.getChain(),
                kzg: {
                    blobToKzgCommitment: function(blob: Uint8Array): Uint8Array {
                        throw new Error("Function not implemented.");
                    },
                    computeBlobKzgProof: function(blob: Uint8Array, commitment: Uint8Array): Uint8Array {
                        throw new Error("Function not implemented.");
                    }
                }
            });

            return {
                hash,
                from: this.walletProvider.getAddress(),
                to: params.recipientAddress,
                value: parseEther(params.amount.toString())
            };
        } catch (error) {
            throw new Error(`ETH transfer failed: ${error.message}`);
        }
    }
}

export const transferETHAction = {
    name: "TBA_TRANSFER_ETH",
    description: "Transfer ETH from TBA",
    handler: async (runtime: IAgentRuntime, message, state, options) => {
        const walletProvider = getWalletProvider(runtime);
        const action = new TransferETHAction(walletProvider);
        return action.transfer(options);
    },
    validate: async (runtime) => {
        const tbConfig = runtime.character.tokenbound;
        if (!tbConfig?.address) return false;
        const key = runtime.getSetting(tbConfig.owner?.key ?? '');
        return !!(key);
    },
    similes: ["SEND_ETH", "ETH_TRANSFER", "MOVE_ETH"],
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                }
            }
        ]
    ]
};