import PostHog from 'posthog-react-native';

import { POSTHOG_API_KEY, POSTHOG_HOST } from './config';
import type { AnalyticsGateway } from './types';

/**
 * עוטף posthog-react-native. בניגוד ל-RevenueCat/AdMob, זה לא native-only
 * module שדורש Dev Build — עובד גם ב-Expo Go/web (persistence דרך
 * AsyncStorage) — אז אין `nativeGateway.web.ts` נפרד.
 */
export const createNativeAnalyticsGateway = (): AnalyticsGateway => {
  let client: PostHog | null = null;

  return {
    kind: 'native',
    async configure() {
      if (client || !POSTHOG_API_KEY) return;
      client = new PostHog(POSTHOG_API_KEY, { host: POSTHOG_HOST });
    },
    capture(name, properties) {
      client?.capture(name, properties);
    },
    identify(userId) {
      client?.identify(userId);
    },
    reset() {
      client?.reset();
    },
  };
};
