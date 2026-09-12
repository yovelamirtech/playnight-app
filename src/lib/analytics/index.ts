import { createCachedGateway } from '@/lib/createCachedGateway';

import { isPostHogConfigured } from './config';
import { createMockAnalyticsGateway } from './mockGateway';
import { createNativeAnalyticsGateway } from './nativeGateway';
import type { AnalyticsGateway } from './types';

/** נקודת הכניסה היחידה ל-PostHog (§8 שלב 4). */
export const getAnalyticsGateway: () => AnalyticsGateway = createCachedGateway(
  isPostHogConfigured,
  createNativeAnalyticsGateway,
  createMockAnalyticsGateway
);

export { isPostHogConfigured } from './config';
export type { AnalyticsGateway } from './types';
export type { AnalyticsEventName, AnalyticsEventProperties } from './events';
