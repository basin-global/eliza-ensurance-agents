import type { Plugin } from "@ai16z/eliza";
import { transferETHAction } from "./actions/transferETH";
import { transferERC20Action } from "./actions/transferERC20";
import { tokenboundProvider } from "./providers/provider";
import { signMessageAction } from "./actions/signMessage";
import { getBalanceAction } from "./actions/getBalance";

async function createTokenboundPlugin(
    getSetting: (key: string) => string | undefined
): Promise<Plugin> {
    return {
        name: "Tokenbound",
        description: "TBA interactions plugin",
        providers: [tokenboundProvider],
        actions: [
            transferETHAction,
            transferERC20Action,
            signMessageAction,
            getBalanceAction
        ]
    };
}

export default createTokenboundPlugin;