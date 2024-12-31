import { createWalletClient, createPublicClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Chain } from "viem";
import * as chains from "viem/chains";
import type { WalletConfig } from "../types";
import type { IAgentRuntime } from "@elizaos/core";
import type { TokenboundCharacter } from "../types";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class TokenboundWalletProvider {
    private account;
    private chain: Chain;
    private readonly tbaAddress: Address;

    constructor(private config: WalletConfig) {
        this.tbaAddress = config.tbaAddress as Address;
        this.chain = chains[config.chain];
        this.account = privateKeyToAccount(config.privateKey);
    }

    private async withRetry<T>(operation: () => T): Promise<T> {
        let lastError: Error | undefined;

        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                return await Promise.resolve(operation());
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                if (i < MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
                }
            }
        }

        throw lastError || new Error('Operation failed after retries');
    }

    getWalletClient() {
        return this.withRetry(() => createWalletClient({
            account: this.account,
            chain: this.chain,
            transport: http()
        }));
    }

    getPublicClient() {
        return this.withRetry(() => createPublicClient({
            chain: this.chain,
            transport: http()
        }));
    }

    getAddress(): Address {
        return this.tbaAddress;
    }

    getChain(): Chain {
        return this.chain;
    }
}

export function getWalletProvider(runtime: IAgentRuntime): TokenboundWalletProvider {
    if (!runtime?.character) {
        throw new Error("Invalid runtime: missing character configuration");
    }

    const character = runtime.character as TokenboundCharacter;
    const tbConfig = character.tokenbound;

    console.log('Initializing wallet provider...');

    if (!tbConfig?.address) throw new Error("Tokenbound address not configured");
    console.log('Found TBA address:', tbConfig.address);

    const key = runtime.getSetting(tbConfig.owner?.key ?? '');
    if (!key) throw new Error("Tokenbound key not configured");
    console.log('Found private key configuration');

    // Format and validate private key
    const formattedKey = key.startsWith('0x')
        ? key.toLowerCase()
        : `0x${key.toLowerCase()}`;

    const keyWithoutPrefix = formattedKey.replace('0x', '');
    if (keyWithoutPrefix.length !== 64) {
        console.log('Key validation failed');
        throw new Error(`Invalid private key length: got ${keyWithoutPrefix.length} chars, need 64 (32 bytes)`);
    }
    console.log('Key validation passed');

    try {
        const config: WalletConfig = {
            type: 'eoa',
            tbaAddress: tbConfig.address,
            privateKey: formattedKey as `0x${string}`,
            chain: tbConfig.chain || "base"
        };
        console.log('Creating wallet provider for chain:', config.chain);

        return new TokenboundWalletProvider(config);
    } catch (error: unknown) {
        console.error('Error getting balance:', error);
        throw new Error(`Failed to get native balance: ${error instanceof Error ? error.message : String(error)}`);
    }
}