import { createCachedGateway } from '@/lib/createCachedGateway';

import { isSteamConfigured } from './config';
import { steamProxyGateway } from './httpGateway';
import { createMockSteamGateway } from './mockGateway';
import type { SteamGateway } from './types';

/** נקודת הכניסה היחידה של ה-UI ל-Steam (§4.3). */
export const getSteamGateway: () => SteamGateway = createCachedGateway(
  isSteamConfigured,
  steamProxyGateway,
  createMockSteamGateway
);

export { isSteamConfigured } from './config';
export { createMockSteamGateway } from './mockGateway';
export * from './types';
