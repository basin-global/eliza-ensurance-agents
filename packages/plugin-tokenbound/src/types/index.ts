import type { Plugin } from "@elizaos/core";
import type { Address, Hash, TransactionReceipt } from "viem";

// Core config types
export interface TokenboundConfig {
    registryAddress?: Address;
    implementationAddress?: Address;
    salt?: `0x${string}`;
    chain?: string;
    onchainName?: string;
    address?: Address;
    owner?: {
        type: 'eoa' | string;
        key: string;
    };
}

// Also add WalletConfig that was missing
export interface WalletConfig {
    type: 'eoa';
    tbaAddress: Address;
    privateKey: `0x${string}`;
    chain: string;
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

// Add the missing types
export interface Transaction {
    hash: Hash;
    from: Address;
    to: Address;
    value: bigint;
    data?: `0x${string}`;
    chainId?: number;
}

export interface TransferETHParams {
    recipientAddress: Address;
    amount: number | string;
}

export interface TransferERC20Params {
    recipientAddress: Address;
    amount: number | string;
    erc20tokenAddress: Address;
    erc20tokenDecimals: number;
    chainId?: number;
}

// Add SignMessageParams type
export interface SignMessageParams {
    message: string | { raw: string | Uint8Array } | Uint8Array;
}