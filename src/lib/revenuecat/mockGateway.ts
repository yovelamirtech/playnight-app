import type { CustomerStatus, RevenueCatGateway, SubscriptionPackage } from './types';

/**
 * מימוש אופליין — משמש כשאין מפתחות RevenueCat (config.ts) וגם כברירת
 * מחדל על web (`react-native-purchases` הוא native-only, ראה nativeGateway.web.ts).
 * "רוכש" בזיכרון בלבד, לא נוגע ב-store אמיתי — מאפשר לבנות/לבדוק את מסך
 * ה-paywall בלי Dev Build.
 */
const MOCK_PACKAGES: SubscriptionPackage[] = [
  { identifier: 'playnight_pro_monthly', period: 'monthly', priceString: '$3.99' },
  { identifier: 'playnight_pro_annual', period: 'annual', priceString: '$24.99' },
];

export const createMockRevenueCatGateway = (): RevenueCatGateway => {
  let isPro = false;
  const listeners = new Set<(status: CustomerStatus) => void>();
  const notify = () => listeners.forEach((listener) => listener({ isPro }));

  return {
    kind: 'mock',
    async configure() {},
    async getPackages() {
      return MOCK_PACKAGES;
    },
    async purchase() {
      isPro = true;
      notify();
      return { isPro };
    },
    async restorePurchases() {
      return { isPro };
    },
    async getCustomerStatus() {
      return { isPro };
    },
    onCustomerStatusChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};
