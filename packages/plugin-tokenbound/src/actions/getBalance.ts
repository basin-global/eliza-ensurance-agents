import { type Address, formatUnits } from "viem";
import { type TokenboundWalletProvider } from "../providers/wallet";
import { getWalletProvider } from "../providers/wallet";
import { erc20ABI } from "viem"; // For ERC20 token queries

export class GetBalanceAction {
    constructor(private walletProvider: TokenboundWalletProvider) {}

    async getBalance(params: {
        address?: Address,
        tokenAddress?: Address  // Optional - if provided, check ERC20 balance
        decimals?: number      // For ERC20 tokens
    }): Promise<{
        address: Address,
        tokenAddress?: Address,
        balance: string,
        type: 'native' | 'erc20'
    }> {
        const targetAddress = params.address || this.walletProvider.tbaAddress;
        const publicClient = this.walletProvider.getPublicClient();

        // If tokenAddress provided, get ERC20 balance
        if (params.tokenAddress) {
            const balance = await publicClient.readContract({
                address: params.tokenAddress,
                abi: erc20ABI,
                functionName: 'balanceOf',
                args: [targetAddress]
            });

            return {
                address: targetAddress,
                tokenAddress: params.tokenAddress,
                balance: formatUnits(balance, params.decimals || 18),
                type: 'erc20'
            };
        }

        // Otherwise get native token balance
        const balance = await publicClient.getBalance({
            address: targetAddress
        });

        return {
            address: targetAddress,
            balance: formatUnits(balance, 18),
            type: 'native'
        };
    }
}

export const getBalanceAction = {
    name: "TBA_GET_BALANCE",
    description: "Get native token balance of any address (defaults to own TBA)",
    handler: async (runtime, message, state, options) => {
        const walletProvider = getWalletProvider(runtime.getSetting);
        const action = new GetBalanceAction(walletProvider);
        return action.getBalance(options?.address);
    },
    template: `Given the recent messages, extract:
    - Address to check (optional)
    - Token address (optional - if checking ERC20 balance)
    - Token decimals (optional - defaults to 18)

    Context:
    - "your balance" means check agent's TBA (${this.walletProvider.tbaAddress})
    - "my balance" requires user's address to be known from context
    - Specific address overrides any pronouns

    Common queries:
    "What's your balance?" -> Check agent's TBA balance
    "What's my USDC balance?" -> Need user's address from context
    "Check balance of 0x123" -> Check specific address

    Respond with JSON:
    {
        "address": string | null,  // null means check agent's TBA
        "tokenAddress": string | null,  // null means check native token
        "decimals": number | null   // null means use default (18)
    }`,
    validate: async (runtime) => {
        return true; // No auth needed for balance checks
    }
};