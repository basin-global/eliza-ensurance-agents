import { purposeProvider, influenceProvider } from './providers';
export * from './types';

// Export the module
export const extendModule = {
  providers: [purposeProvider, influenceProvider]
};