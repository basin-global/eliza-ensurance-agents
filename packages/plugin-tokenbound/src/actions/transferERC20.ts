import { parseUnits } from "viem";
import type { TokenboundWalletProvider } from "../providers/wallet";
import type { Transaction, TransferERC20Params } from "../types";

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
                chain: params.chainId ? undefined : undefined // Will add cross-chain support later
            });

            return {
                hash,
                from: params.account,
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
    handler: async (runtime, message, state, options) => {
        const walletProvider = getWalletProvider(runtime.getSetting);
        const action = new TransferERC20Action(walletProvider);
        return action.transfer(options);
    },
    template: `Given the recent messages, extract:
    - Token address
    - Token decimals (1-18)
    - Amount in decimal form (e.g. 0.1 USDC)
    - Recipient address
    - Chain ID (optional)

    Respond with JSON:
    {
        "account": "<tba_address>",
        "amount": number,
        "recipientAddress": string,
        "erc20tokenAddress": string,
        "erc20tokenDecimals": number,
        "chainId": number | null
    }`,
    validate: async (runtime) => {
        const tbaAddress = runtime.getSetting("TBA_ADDRESS");
        const privateKey = runtime.getSetting("TBA_PRIVATE_KEY");
        return !!(tbaAddress && privateKey);
    }
};