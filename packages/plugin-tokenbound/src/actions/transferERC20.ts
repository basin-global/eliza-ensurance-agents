import { parseUnits, encodeFunctionData, type Address } from "viem";
import type { TokenboundWalletProvider } from "../providers/wallet";
import { getWalletProvider } from "../providers/wallet";
import type { Transaction, TransferERC20Params } from "../types";
import type { IAgentRuntime } from "@elizaos/core";

export class TransferERC20Action {
    constructor(private walletProvider: TokenboundWalletProvider) {}

    async transfer(params: TransferERC20Params): Promise<Transaction> {
        const walletClient = this.walletProvider.getWalletClient();

        // Convert amount to proper decimals
        const value = parseUnits(
            params.amount.toString(),
            params.erc20tokenDecimals
        );

        // Encode ERC20 transfer function call
        const data = encodeERC20TransferData(
            params.recipientAddress,
            value
        );

        try {
            const hash = await walletClient.sendTransaction({
                account: walletClient.account,
                to: params.erc20tokenAddress,
                value: 0n,
                data,
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
                to: params.erc20tokenAddress,
                value: 0n,
                data,
                chainId: params.chainId
            };
        } catch (error) {
            throw new Error(`ERC20 transfer failed: ${error.message}`);
        }
    }
}

// Helper to encode ERC20 transfer function call
function encodeERC20TransferData(to: Address, value: bigint): `0x${string}` {
    // ERC20 transfer function signature
    return encodeFunctionData({
        abi: [{
            name: 'transfer',
            type: 'function',
            inputs: [
                { name: 'recipient', type: 'address' },
                { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ type: 'bool' }]
        }],
        functionName: 'transfer',
        args: [to, value]
    });
}

export const transferERC20Action = {
    name: "TBA_TRANSFER_ERC20",
    description: "Transfer ERC20 tokens from TBA",
    handler: async (runtime: IAgentRuntime, message, state, options) => {
        const walletProvider = getWalletProvider(runtime);
        const action = new TransferERC20Action(walletProvider);
        return action.transfer(options);
    },
    validate: async (runtime) => {
        const tbConfig = runtime.character.tokenbound;
        if (!tbConfig?.address) return false;
        const key = runtime.getSetting(tbConfig.owner?.key ?? '');
        return !!(key);
    },
    similes: ["SEND_TOKEN", "TOKEN_TRANSFER", "TRANSFER_TOKEN"],
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Send 10 USDC to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                }
            }
        ]
    ]
};