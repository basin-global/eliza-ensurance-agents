import type { Plugin } from "@elizaos/core";
import type { Address, Hash, TransactionReceipt } from "viem";

// Core config types
export interface TokenboundConfig {
    registryAddress?: Address;
    implementationAddress?: Address;
    salt?: `0x${string}`;
    chain?: string;
    onchainName?: string;
}

// Character types
export interface TokenboundCharacter {
    tokenbound?: TokenboundConfig;
}

// State management
export interface TokenboundState {
    config: TokenboundConfig;
}

// Transaction types
export interface TransferDetails {
    to: Address;
    value: bigint;
    data?: `0x${string}`;
}

export interface TransactionDetails {
    hash: Hash;
    receipt?: TransactionReceipt;
    error?: string;
}

// Response types
export interface BalanceResponse {
    balance: bigint;
    formatted: string;
}

export interface TransferResponse {
    transaction: TransactionDetails;
    success: boolean;
}