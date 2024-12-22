import { Address, Hash, Chain } from "viem";
import * as chains from "viem/chains";

export type SupportedChain = keyof typeof chains;

export interface Transaction {
    hash: Hash;
    from: Address;
    to: Address;
    value: bigint;
    data?: `0x${string}`;
    chainId?: number;
}

export interface TransferETHParams {
    account: Address;    // TBA address
    amount: number;      // Amount in decimal form (eg. 0.01 ETH)
    recipientAddress: Address;
    chainId?: number;    // Optional for cross-chain
}

export interface TransferERC20Params {
    account: Address;    // TBA address
    amount: number;      // Amount in decimal form (eg. 0.1 USDC)
    recipientAddress: Address;
    erc20tokenAddress: Address;
    erc20tokenDecimals: number;  // Token decimal specification (1-18)
    chainId?: number;    // Optional for cross-chain
}

export type WalletType =
    | 'eoa'           // Standard EOA with private key
    | 'server';       // Server-side wallet API

export interface WalletConfig {
    type: WalletType;
    tbaAddress: string;
    onchainName?: string;    // Optional TBA name (ENS, Situs, etc)
    privateKey?: `0x${string}`;  // For EOA
    apiKey?: string;             // For server wallet
    chain: SupportedChain;
}

export type UniversalSignableMessage =
    | string
    | { raw: Uint8Array }  // For viem
    | Uint8Array;          // For ethers

export interface SignMessageParams {
    account: Address;
    message: UniversalSignableMessage;
}