import * as chains from "viem/chains";
import type { IAgentRuntime, Provider } from "@elizaos/core";
import { getWalletProvider } from "./wallet";
import type { TokenboundCharacter } from "../types";

export const tokenboundProvider: Provider = {
    async get(runtime: IAgentRuntime): Promise<string | null> {
        try {
            const walletProvider = getWalletProvider(runtime);
            const character = runtime.character as TokenboundCharacter;
            const tbConfig = character.tokenbound;
            const chain = chains[tbConfig?.chain || "base"];

            return `Tokenbound Account: ${walletProvider.getAddress()}
                    ${tbConfig?.onchainName ? `Name: ${tbConfig.onchainName}` : ''}
                    Chain: ${chain.name} (${chain.id})
                    Role: Beaver Habitat Sovereign Account`;
        } catch (error) {
            console.error("Error in Tokenbound provider:", error);
            return null;
        }
    }
};