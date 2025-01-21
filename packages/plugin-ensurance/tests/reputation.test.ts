import { IAgentRuntime, Memory, State } from '@elizaos/core';
import { reputationProvider } from '../src/modules/reputation/providers';

describe('Reputation Module', () => {
  let mockRuntime: IAgentRuntime;

  beforeEach(() => {
    mockRuntime = {
      getSetting: jest.fn(),
    } as unknown as IAgentRuntime;
  });

  describe('Reputation Provider', () => {
    it('should return empty aspires array when no config', async () => {
      (mockRuntime.getSetting as jest.Mock).mockReturnValue(undefined);
      const result = await reputationProvider.get(mockRuntime, {} as Memory, {} as State);
      expect(result.reputation.aspires).toEqual([]);
    });

    it('should return configured aspirations', async () => {
      const aspirations = ['Trusted Token Handler', 'Secure Transaction Processor'];
      (mockRuntime.getSetting as jest.Mock).mockReturnValue({ aspires: aspirations });
      const result = await reputationProvider.get(mockRuntime, {} as Memory, {} as State);
      expect(result.reputation.aspires).toEqual(aspirations);
    });
  });
});