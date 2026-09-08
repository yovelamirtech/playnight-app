import { isSteamConfigured } from './config';
import { steamProxyGateway } from './httpGateway';
import { createMockSteamGateway } from './mockGateway';
import type { SteamGateway } from './types';

let cached: SteamGateway | null = null;

/** נקודת הכניסה היחידה של ה-UI ל-Steam (§4.3). */
export const getSteamGateway = (): SteamGateway => {
  if (!cached) {
    cached = isSteamConfigured() ? steamProxyGateway() : createMockSteamGateway();
  }
  return cached;
};

export { isSteamConfigured } from './config';
export { createMockSteamGateway } from './mockGateway';
export * from './types';
