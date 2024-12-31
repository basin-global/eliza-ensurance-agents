import { type IAgentRuntime, type Memory, type State, type HandlerCallback, type Action, type Character } from "@elizaos/core";
import type { Address } from "viem";

// Add TokenboundCharacter type
interface TokenboundCharacter extends Character {
    tokenbound?: {
        address: string;
        chain?: string;
        owner?: {
            key: string;
        };
    };
}

// Export the TokenBalance interface
export interface TokenBalance {
    token_id?: string;
    fungible_id?: string;
    name: string;
    symbol: string;
    decimals: number;
    chain: string;
    total_quantity: number;
    total_quantity_string: string;
    total_value_usd_cents: number;
    queried_wallet_balances: Array<{
        address: string;
        quantity: number;
        quantity_string: string;
        value_usd_cents: number;
        value_usd_string?: string;
    }>;
}

interface SimpleHashBalance {
    fungibles: TokenBalance[];
    groupedBalances: Record<string, TokenBalance[]>;
    ethPrice: number | null;
}

export class GetBalanceAction {
    constructor(
        private address: Address,
        private simpleHashKey: string
    ) {}

    async getAllBalances(): Promise<SimpleHashBalance> {
        try {
            const response = await fetch(
                `https://ensitus.xyz/api/simplehash/native-erc20?address=${this.address}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.simpleHashKey}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`SimpleHash API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (err: unknown) {
            const error = err instanceof Error ? err.message : String(err);
            throw new Error(`Failed to get balances: ${error}`);
        }
    }

    formatBalanceResponse(data: SimpleHashBalance): string {
        console.log('Formatting response data:', JSON.stringify(data, null, 2));
        const lines: string[] = [];
        const seenBalances = new Set(); // Track unique balances

        // Helper function to format numbers
        const formatTokenAmount = (amount: string, decimals: number): string => {
            const value = Number(amount) / Math.pow(10, decimals);
            return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
        };

        // Process all balances and deduplicate
        const processBalance = (token: TokenBalance) => {
            if (token.total_quantity_string !== "0") {
                const amount = formatTokenAmount(token.total_quantity_string, token.decimals);
                const usdValue = token.total_value_usd_cents / 100;
                const balanceLine = `base ${token.symbol}: ${amount} ($${usdValue.toFixed(2)})`;

                // Only add if we haven't seen this balance before
                if (!seenBalances.has(balanceLine)) {
                    seenBalances.add(balanceLine);
                    lines.push(balanceLine);
                }
            }
        };

        // Process Base chain balances
        const baseBalances = data.groupedBalances['base'] || [];
        baseBalances.forEach(processBalance);

        // Process Base chain fungible tokens
        data.fungibles
            .filter(token => token.chain === 'base')
            .forEach(processBalance);

        if (lines.length === 0) {
            lines.push('No balances found');
        }

        const response = lines.join('\n');
        console.log('Formatted response:', response);
        return response;
    }
}

export const getBalanceAction: Action = {
    name: "TBA_GET_BALANCE",
    description: "Get token balances for the Tokenbound Account (TBA)",
    handler: async (runtime, memory, state, options, callback) => {
        try {
            // Validate state
            if (!state) {
                state = await runtime.composeState(memory);
            }

            // Get configuration
            const character = runtime.character as TokenboundCharacter;
            const tbConfig = character.tokenbound;
            if (!tbConfig?.address) {
                throw new Error("TBA_NOT_CONFIGURED");
            }

            const simpleHashKey = runtime.getSetting('SIMPLEHASH_API_KEY');
            if (!simpleHashKey) {
                throw new Error("SIMPLEHASH_KEY_MISSING");
            }

            // Get balances
            const action = new GetBalanceAction(
                tbConfig.address as Address,
                simpleHashKey
            );
            const balances = await action.getAllBalances();
            const response = action.formatBalanceResponse(balances);

            if (callback) {
                callback({
                    text: response,
                    content: {
                        success: true,
                        balances,
                        formatted: response,
                        address: tbConfig.address
                    }
                });
            }
            return true;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error('Balance check failed:', error);

            if (callback) {
                const errorMessage = {
                    TBA_NOT_CONFIGURED: "This character's Tokenbound Account is not configured.",
                    SIMPLEHASH_KEY_MISSING: "SimpleHash API key is not configured.",
                }[error.message] || `Error getting balances: ${error.message}`;

                callback({
                    text: errorMessage,
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
        return !!(tbConfig?.address && runtime.getSetting('SIMPLEHASH_API_KEY'));
    },
    similes: [
        "GET_BALANCE",
        "CHECK_BALANCE",
        "BALANCE_CHECK",
        "SHOW_TOKENS",
        "VIEW_WALLET"
    ],
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Show me my wallet balance"
                }
            },
            {
                user: "agent",
                content: {
                    text: "Here are your token balances:\nETH: 1.5 ($3000)\nUSDC: 100 ($100)",
                    action: "TBA_GET_BALANCE"
                }
            }
        ],
        [
            {
                user: "user",
                content: {
                    text: "What tokens do I have?"
                }
            },
            {
                user: "agent",
                content: {
                    text: "Here are your token balances:\nNo balances found",
                    action: "TBA_GET_BALANCE"
                }
            }
        ]
    ]
};