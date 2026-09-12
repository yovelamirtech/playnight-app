import { createCachedGateway } from '@/lib/createCachedGateway';

import { isIgdbConfigured } from './config';
import { igdbProxyGateway } from './httpGateway';
import { createMockIgdbGateway } from './mockGateway';
import type { IgdbGateway } from './types';

/** נקודת הכניסה היחידה של ה-UI ל-IGDB. */
export const getIgdbGateway: () => IgdbGateway = createCachedGateway(
  isIgdbConfigured,
  igdbProxyGateway,
  createMockIgdbGateway
);

export { isIgdbConfigured };
export { createMockIgdbGateway } from './mockGateway';
export * from './types';
