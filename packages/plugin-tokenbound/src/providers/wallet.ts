import { createWalletClient, http, type Address, Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import type { WalletConfig } from "../types";
import { formatUnits } from "viem";

export class TokenboundWalletProvider {
    private account;
    private tbaAddress: Address;
    private chain: Chain;
    private supportedChains: Chain[];

    constructor(private config: WalletConfig) {
        this.tbaAddress = config.tbaAddress as Address;
        this.chain = chains[config.chain];
        this.supportedChains = config.supportedChains?.map(c => chains[c]) || [this.chain];

        if (config.type === 'eoa') {
            this.account = privateKeyToAccount(config.privateKey as `0x${string}`);
        }
    }

    getWalletClient(chainId?: number) {
        const chain = chainId ?
            this.supportedChains.find(c => c.id === chainId) :
            this.chain;

        if (!chain) throw new Error(`Chain ${chainId} not supported`);

        return createWalletClient({
            account: this.account,
            chain,
            transport: http()
        });
    }

    async getNativeBalance(): Promise<string> {
        const publicClient = this.getPublicClient();
        const balance = await publicClient.getBalance({
            address: this.tbaAddress  // Query TBA address directly
        });
        return formatUnits(balance, 18);
    }

    getChain(): Chain {
        return this.chain;
    }

    getPublicClient() {
        return createPublicClient({
            chain: this.chain,
            transport: http()
        });
    }
}

export function getWalletProvider(getSetting: (key: string) => string | undefined) {
    const tbConfig = runtime.character.tokenbound;
    if (!tbConfig?.address) throw new Error("Tokenbound address not configured");

    const key = getSetting(tbConfig.owner?.key);
    if (!key) throw new Error("Tokenbound key not configured");

    const config: WalletConfig = {
        type: tbConfig.owner?.type || "eoa",
        tbaAddress: tbConfig.address,
        privateKey: tbConfig.owner?.type === 'eoa' ? key as `0x${string}` : undefined,
        apiKey: tbConfig.owner?.type !== 'eoa' ? key : undefined,
        chain: tbConfig.chain || "base"
    };

    return new TokenboundWalletProvider(config);
}