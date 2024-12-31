import * as chains from "viem/chains";
import type { IAgentRuntime, Provider } from "@elizaos/core";
import { getWalletProvider } from "./wallet";
import type { TokenboundCharacter } from "../types";

// Simple in-memory cache implementation
const cache = new Map<string, { value: string; expires: number }>();

// List of actions that should trigger tokenbound initialization
const TOKENBOUND_ACTIONS = [
    'TBA_GET_BALANCE',
    'TBA_TRANSFER_ETH',
    'TBA_TRANSFER_ERC20',
    'TBA_SIGN_MESSAGE'
];

export const tokenboundProvider: Provider = {
    /**
     * Gets Tokenbound Account information for the character
     * @param runtime The agent runtime context
     * @returns Formatted TBA information or null if not configured
     */
    async get(runtime: IAgentRuntime): Promise<string | null> {
        try {
            // Check if this is a tokenbound-related action
            const currentMessage = runtime.getCurrentMessage?.();
            const action = currentMessage?.content?.action;
            if (!action || !TOKENBOUND_ACTIONS.includes(action)) {
                return null;
            }

            // First check if this character has tokenbound config
            const character = runtime.character as TokenboundCharacter;
            const tbConfig = character.tokenbound;
            if (!tbConfig?.address || !runtime.getSetting(tbConfig.owner?.key ?? '')) {
                return null;
            }

            const cacheKey = `tokenbound:${runtime.agentId}`;
            const cached = cache.get(cacheKey);
            const now = Date.now();
            if (cached && cached.expires > now) {
                return cached.value;
            }

            // Only initialize wallet if we need to
            const walletProvider = getWalletProvider(runtime);
            const chain = chains[tbConfig.chain || "base"];

            const response = `Tokenbound Account: ${walletProvider.getAddress()}
                    ${tbConfig.onchainName ? `Name: ${tbConfig.onchainName}` : ''}
                    Chain: ${chain.name} (${chain.id})`;

            cache.set(cacheKey, {
                value: response,
                expires: now + 5 * 60 * 1000
            });

            return response;
        } catch (error) {
            console.error("Error in Tokenbound provider:", error);
            return null;  // Return null instead of error message
        }
    }
};