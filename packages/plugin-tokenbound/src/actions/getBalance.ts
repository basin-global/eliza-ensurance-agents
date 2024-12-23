import { type IAgentRuntime } from "@elizaos/core";
import { type TokenboundWalletProvider } from "../providers/wallet";
import { getWalletProvider } from "../providers/wallet";
import { erc20Abi, formatUnits } from "viem";

export class GetBalanceAction {
    constructor(private walletProvider: TokenboundWalletProvider) {}

    async getNativeBalance(): Promise<string> {
        try {
            const publicClient = this.walletProvider.getPublicClient();
            const balance = await publicClient.getBalance({
                address: this.walletProvider.getAddress()
            });
            return formatUnits(balance, 18);
        } catch (error) {
            throw new Error(`Failed to get native balance: ${error.message}`);
        }
    }

    async getERC20Balance(tokenAddress: string, decimals: number = 18): Promise<string> {
        try {
            const publicClient = this.walletProvider.getPublicClient();
            const balance = await publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [this.walletProvider.getAddress()]
            });
            return formatUnits(balance, decimals);
        } catch (error) {
            throw new Error(`Failed to get ERC20 balance: ${error.message}`);
        }
    }
}

export const getBalanceAction = {
    name: "TBA_GET_BALANCE",
    description: "Get TBA balance",
    handler: async (runtime: IAgentRuntime) => {
        const walletProvider = getWalletProvider(runtime);
        const action = new GetBalanceAction(walletProvider);
        const balance = await action.getNativeBalance();
        const chain = walletProvider.getChain();
        return `Balance: ${balance} ${chain.nativeCurrency.symbol}`;
    },
    validate: async (runtime) => {
        const tbConfig = runtime.character.tokenbound;
        if (!tbConfig?.address) return false;
        const key = runtime.getSetting(tbConfig.owner?.key ?? '');
        return !!(key);
    },
    similes: ["GET_BALANCE", "CHECK_BALANCE", "BALANCE_CHECK"],
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "What's my balance?"
                }
            }
        ]
    ]
};