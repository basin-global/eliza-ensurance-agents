import { IAgentRuntime, Memory, State } from '@elizaos/core';
import { impactProvider } from '../src/modules/impact/providers';

describe('Impact Module', () => {
  let mockRuntime: IAgentRuntime;

  beforeEach(() => {
    mockRuntime = {
      getSetting: jest.fn(),
    } as unknown as IAgentRuntime;
  });

  describe('Impact Provider', () => {
    it('should return empty impact array when no config', async () => {
      (mockRuntime.getSetting as jest.Mock).mockReturnValue(undefined);
      const result = await impactProvider.get(mockRuntime, {} as Memory, {} as State);
      expect(result.impact).toEqual({ impact: [] });
    });

    it('should return configured impacts', async () => {
      const impacts = ['Enable secure transfers', 'Improve DeFi accessibility'];
      (mockRuntime.getSetting as jest.Mock).mockReturnValue({ impact: impacts });
      const result = await impactProvider.get(mockRuntime, {} as Memory, {} as State);
      expect(result.impact).toEqual({ impact: impacts });
    });
  });
});