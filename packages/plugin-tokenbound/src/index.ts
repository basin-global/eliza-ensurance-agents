import { Plugin } from "@elizaos/core";
import { transferETHAction } from "./actions/transferETH";
import { transferERC20Action } from "./actions/transferERC20";
import { getBalanceAction } from "./actions/getBalance";
import { tokenboundProvider } from "./providers/provider";
import { tokenboundBalanceEvaluator } from "./evaluators/balance";
import { tokenboundTransactionEvaluator } from "./evaluators/transaction";

/**
 * Tokenbound Plugin
 * Provides functionality for interacting with Tokenbound Accounts (TBA)
 * including balance checks, transfers, and transaction management.
 */
export const tokenboundPlugin: Plugin = {
    name: "tokenbound",
    description: "TBA interactions plugin",
    actions: [
        transferETHAction,
        transferERC20Action,
        getBalanceAction
    ],
    providers: [tokenboundProvider],
    evaluators: [
        tokenboundBalanceEvaluator,
        tokenboundTransactionEvaluator
    ]
};

export default tokenboundPlugin;