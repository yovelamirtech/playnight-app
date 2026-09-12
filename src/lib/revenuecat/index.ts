import { Platform } from 'react-native';

import { createCachedGateway } from '@/lib/createCachedGateway';

import { isRevenueCatConfigured } from './config';
import { createMockRevenueCatGateway } from './mockGateway';
import { createNativeRevenueCatGateway } from './nativeGateway';
import type { RevenueCatGateway } from './types';

/**
 * נקודת הכניסה היחידה ל-RevenueCat (§8 שלב 4). web תמיד מקבל mock —
 * `react-native-purchases` הוא native-only (ראה nativeGateway.web.ts).
 */
export const getRevenueCatGateway: () => RevenueCatGateway = createCachedGateway(
  () => isRevenueCatConfigured() && Platform.OS !== 'web',
  createNativeRevenueCatGateway,
  createMockRevenueCatGateway
);

export { isRevenueCatConfigured } from './config';
export { createMockRevenueCatGateway } from './mockGateway';
export * from './types';
