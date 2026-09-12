import { Platform } from 'react-native';

import { isRevenueCatConfigured } from './config';
import { createMockRevenueCatGateway } from './mockGateway';
import { createNativeRevenueCatGateway } from './nativeGateway';
import type { RevenueCatGateway } from './types';

let cached: RevenueCatGateway | null = null;

/**
 * נקודת הכניסה היחידה ל-RevenueCat (§8 שלב 4). web תמיד מקבל mock —
 * `react-native-purchases` הוא native-only (ראה nativeGateway.web.ts).
 */
export const getRevenueCatGateway = (): RevenueCatGateway => {
  if (!cached) {
    cached =
      isRevenueCatConfigured() && Platform.OS !== 'web'
        ? createNativeRevenueCatGateway()
        : createMockRevenueCatGateway();
  }
  return cached;
};

export { isRevenueCatConfigured } from './config';
export { createMockRevenueCatGateway } from './mockGateway';
export * from './types';
