import { Service, IAgentRuntime } from '@elizaos/core';
import type { PluginConfig } from '../../types';
import { securityProvider } from './providers/security';
import { policyEvaluator } from './evaluators/policy';
import { getNativeErc20BalanceAction } from './actions/getNativeErc20Balance';
import { getNftBalanceAction } from './actions/getNftBalance';

export * from './types';
export * from './actions';

// Module exports
export const tokenboundModule = {
  actions: [
    getNativeErc20BalanceAction,
    getNftBalanceAction
  ],
  providers: [securityProvider],
  evaluators: [policyEvaluator],
  initialize: async (runtime: IAgentRuntime) => {
    // Will add initialization if needed
  }
};