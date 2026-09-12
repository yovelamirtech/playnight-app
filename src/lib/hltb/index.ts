import { createCachedGateway } from '@/lib/createCachedGateway';

import { isHltbConfigured } from './config';
import { hltbProxyGateway } from './httpGateway';
import { createMockHltbGateway } from './mockGateway';
import type { HltbGateway } from './types';

/** נקודת הכניסה היחידה ל-HLTB (§3.6/§3.7). */
export const getHltbGateway: () => HltbGateway = createCachedGateway(
  isHltbConfigured,
  hltbProxyGateway,
  createMockHltbGateway
);

export { isHltbConfigured } from './config';
export { createMockHltbGateway } from './mockGateway';
export * from './types';
