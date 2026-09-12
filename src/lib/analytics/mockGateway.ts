import type { AnalyticsGateway } from './types';

/**
 * משמש כשאין מפתח PostHog (config.ts) — no-op מלא, לא כותב ולא שולח כלום.
 * מאפשר לקרוא ל-capture/identify מכל מקום בקוד בלי if מפוזר בכל call site.
 */
export const createMockAnalyticsGateway = (): AnalyticsGateway => ({
  kind: 'mock',
  async configure() {},
  capture() {},
  identify() {},
  reset() {},
});
