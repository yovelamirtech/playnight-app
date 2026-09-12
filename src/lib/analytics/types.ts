import type { AnalyticsEventName, AnalyticsEventProperties } from './events';

/**
 * הממשק היחיד שה-UI מכיר. PostHog הוא רק "להבין מה אנשים באמת עושים"
 * (SPEC §8 שלב 4) — לא נכנס לשום החלטת מוצר בזמן ריצה, אז אין צורך
 * ב-source-of-truth מקומי כמו RevenueCat (`users.isPro`).
 */
export interface AnalyticsGateway {
  readonly kind: 'mock' | 'native';
  configure(): Promise<void>;
  capture<Name extends AnalyticsEventName>(
    name: Name,
    properties: AnalyticsEventProperties[Name]
  ): void;
  identify(userId: string): void;
  reset(): void;
}
