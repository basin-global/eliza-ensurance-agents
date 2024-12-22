import type { Provider } from "@ai16z/eliza";
import { getWalletProvider } from "./wallet";

export const tokenboundProvider: Provider = {
    async get(runtime: IAgentRuntime): Promise<string | null> {
        try {
            const walletProvider = getWalletProvider(runtime.getSetting);
            const chain = chains[runtime.character.settings.tokenbound?.chain || "base"];

            return `Tokenbound Account: ${walletProvider.tbaAddress}
                    ${tbConfig.onchainName ? `Name: ${tbConfig.onchainName}` : ''}
                    Chain: ${chain.name} (${chain.id})
                    Role: Beaver Habitat Sovereign Account`;
        } catch (error) {
            console.error("Error in Tokenbound provider:", error);
            return null;
        }
    }
};