import { IAgentRuntime, Memory, State } from '@elizaos/core';
import { placeProvider } from '../src/modules/place/providers';

describe('Place Module', () => {
  let mockRuntime: IAgentRuntime;

  beforeEach(() => {
    mockRuntime = {
      getSetting: jest.fn(),
    } as unknown as IAgentRuntime;
  });

  describe('Place Provider', () => {
    it('should return empty location array when no config', async () => {
      (mockRuntime.getSetting as jest.Mock).mockReturnValue(undefined);
      const result = await placeProvider.get(mockRuntime, {} as Memory, {} as State);
      expect(result.place.location).toEqual([]);
    });

    it('should return configured locations', async () => {
      const locations = ['Ethereum Mainnet', 'DeFi Protocols'];
      (mockRuntime.getSetting as jest.Mock).mockReturnValue({ location: locations });
      const result = await placeProvider.get(mockRuntime, {} as Memory, {} as State);
      expect(result.place.location).toEqual(locations);
    });
  });
});