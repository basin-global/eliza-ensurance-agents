import { TokenboundAction, TokenboundTransaction } from '../types';

export const transferETHAction: TokenboundAction = {
  name: 'TBA_TRANSFER_ETH',
  description: 'Transfer ETH from Tokenbound Account',

  // Will be implemented when we have SDK details
  handler: async (runtime, message, state, options, callback) => {
    return false;
  },

  // Basic validation structure
  validate: async (runtime) => {
    // Will add SDK-specific validation
    return false;
  },

  // Configuration for wallet method
  config: {
    method: 'EOA', // Default to EOA method
  },

  // Action recognition
  similes: ['SEND_ETH', 'ETH_TRANSFER', 'MOVE_ETH'],
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Send 0.1 ETH to 0x742d...'
        }
      },
      {
        user: 'agent',
        content: {
          text: 'I will help you transfer ETH using your tokenbound account.',
          action: 'TBA_TRANSFER_ETH'
        }
      }
    ]
  ]
};