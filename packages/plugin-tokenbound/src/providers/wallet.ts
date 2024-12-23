import { createWalletClient, createPublicClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { Chain } from "viem";
import * as chains from "viem/chains";
import type { WalletConfig } from "../types";
import type { IAgentRuntime } from "@elizaos/core";
import type { TokenboundCharacter } from "../types";

export class TokenboundWalletProvider {
    private account;
    private chain: Chain;
    private readonly tbaAddress: Address;

    constructor(private config: WalletConfig) {
        this.tbaAddress = config.tbaAddress as Address;
        this.chain = chains[config.chain];

        if (config.type === 'eoa') {
            this.account = privateKeyToAccount(config.privateKey);
        }
    }

    getWalletClient() {
        return createWalletClient({
            account: this.account,
            chain: this.chain,
            transport: http()
        });
    }

    getPublicClient() {
        return createPublicClient({
            chain: this.chain,
            transport: http()
        });
    }

    getAddress(): Address {
        return this.tbaAddress;
    }

    getChain(): Chain {
        return this.chain;
    }
}

export function getWalletProvider(runtime: IAgentRuntime): TokenboundWalletProvider {
    const character = runtime.character as TokenboundCharacter;
    const tbConfig = character.tokenbound;
    if (!tbConfig?.address) throw new Error("Tokenbound address not configured");

    const key = runtime.getSetting(tbConfig.owner?.key ?? '');
    if (!key) throw new Error("Tokenbound key not configured");

    const formattedKey = tbConfig.owner?.type === 'eoa'
        ? (key.startsWith('0x') ? key : `0x${key}`)
        : key;

    const config: WalletConfig = {
        type: tbConfig.owner?.type || "eoa",
        tbaAddress: tbConfig.address,
        privateKey: formattedKey as `0x${string}`,
        apiKey: tbConfig.owner?.type !== 'eoa' ? formattedKey : undefined,
        chain: tbConfig.chain || "base"
    };

    return new TokenboundWalletProvider(config);
}