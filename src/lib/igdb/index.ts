import { isIgdbConfigured } from './config';
import { igdbProxyGateway } from './httpGateway';
import { createMockIgdbGateway } from './mockGateway';
import type { IgdbGateway } from './types';

let cached: IgdbGateway | null = null;

/** נקודת הכניסה היחידה של ה-UI ל-IGDB. */
export const getIgdbGateway = (): IgdbGateway => {
  if (!cached) {
    cached = isIgdbConfigured() ? igdbProxyGateway() : createMockIgdbGateway();
  }
  return cached;
};

export { isIgdbConfigured };
export { createMockIgdbGateway } from './mockGateway';
export * from './types';
