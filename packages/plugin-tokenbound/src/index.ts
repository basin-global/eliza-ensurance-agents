import { Plugin } from "@elizaos/core";
import { transferETHAction } from "./actions/transferETH";
import { transferERC20Action } from "./actions/transferERC20";
import { getBalanceAction } from "./actions/getBalance";
import { tokenboundProvider } from "./providers/provider";

export const tokenboundPlugin: Plugin = {
    name: "tokenbound",
    description: "TBA interactions plugin",
    actions: [
        transferETHAction,
        transferERC20Action,
        getBalanceAction
    ],
    providers: [tokenboundProvider]
};

export default tokenboundPlugin;