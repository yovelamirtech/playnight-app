import { isHltbConfigured } from './config';
import { hltbProxyGateway } from './httpGateway';
import { createMockHltbGateway } from './mockGateway';
import type { HltbGateway } from './types';

let cached: HltbGateway | null = null;

/** נקודת הכניסה היחידה ל-HLTB (§3.6/§3.7). */
export const getHltbGateway = (): HltbGateway => {
  if (!cached) {
    cached = isHltbConfigured() ? hltbProxyGateway() : createMockHltbGateway();
  }
  return cached;
};

export { isHltbConfigured } from './config';
export { createMockHltbGateway } from './mockGateway';
export * from './types';
