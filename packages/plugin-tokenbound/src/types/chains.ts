import { type Chain } from "viem";
import * as chains from "viem/chains";

// Types for chain configuration
export interface ChainConfig {
    defaultChain: keyof typeof chains;  // From character config
    supportedChains?: (keyof typeof chains)[];  // Optional additional chains
}

// Helper to validate chain support
export function isChainSupported(
    chainId: number,
    config: ChainConfig
): boolean {
    const defaultChain = chains[config.defaultChain];
    if (defaultChain.id === chainId) return true;

    return config.supportedChains?.some(
        chainName => chains[chainName].id === chainId
    ) ?? false;
}

// Get chain info
export function getChainInfo(chainName: keyof typeof chains): Chain {
    return chains[chainName];
}