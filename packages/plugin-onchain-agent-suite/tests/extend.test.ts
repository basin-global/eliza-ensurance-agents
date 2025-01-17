import { IAgentRuntime, Memory, State } from '@elizaos/core';
import { purposeProvider, influenceProvider } from '../src/modules/extend/providers';

describe('Extend Module', () => {
  let mockRuntime: IAgentRuntime;

  beforeEach(() => {
    mockRuntime = {
      getSetting: jest.fn(),
    } as unknown as IAgentRuntime;
  });

  describe('Purpose Provider', () => {
    it('should return empty purpose array when no config', async () => {
      (mockRuntime.getSetting as jest.Mock).mockReturnValue(undefined);
      const result = await purposeProvider.get(mockRuntime, {} as Memory, {} as State);
      expect(result.purpose).toEqual([]);
    });

    it('should return configured purposes', async () => {
      const purposes = ['Secure token transfers', 'DeFi automation'];
      (mockRuntime.getSetting as jest.Mock).mockReturnValue({ purpose: purposes });
      const result = await purposeProvider.get(mockRuntime, {} as Memory, {} as State);
      expect(result.purpose).toEqual(purposes);
    });
  });

  describe('Influence Provider', () => {
    it('should return empty influence structure when no config', async () => {
      (mockRuntime.getSetting as jest.Mock).mockReturnValue(undefined);
      const result = await influenceProvider.get(mockRuntime, {} as Memory, {} as State);
      expect(result.influence).toEqual({
        influencedBy: {
          operator: [],
          inspiration: []
        },
        seeksToInfluence: {
          audiences: [],
          outcomes: []
        }
      });
    });

    it('should return configured influence structure', async () => {
      const influence = {
        influencedBy: {
          operator: ['DeFi protocols'],
          inspiration: ['Secure systems']
        },
        seeksToInfluence: {
          audiences: ['Token holders'],
          outcomes: ['Better security']
        }
      };
      (mockRuntime.getSetting as jest.Mock).mockReturnValue({ influence });
      const result = await influenceProvider.get(mockRuntime, {} as Memory, {} as State);
      expect(result.influence).toEqual(influence);
    });
  });
});