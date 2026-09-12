import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

import { REVENUECAT_ANDROID_KEY, REVENUECAT_IOS_KEY } from './config';
import { RevenueCatNotConfiguredError } from './types';
import type { CustomerStatus, RevenueCatGateway, SubscriptionPackage } from './types';

/**
 * ה-entitlement שנבדק כדי לקבוע `isPro`. חייב להיות מוגדר בדיוק בשם הזה
 * ב-RevenueCat dashboard (Entitlements → "pro"), משויך לשני המוצרים
 * (playnight_pro_monthly/_annual) — ראה HANDOFF.md.
 */
const PRO_ENTITLEMENT_ID = 'pro';

const toStatus = (info: CustomerInfo): CustomerStatus => ({
  isPro: Boolean(info.entitlements.active[PRO_ENTITLEMENT_ID]),
});

const toPackage = (pkg: PurchasesPackage): SubscriptionPackage => ({
  identifier: pkg.identifier,
  period: pkg.packageType.toLowerCase(),
  priceString: pkg.product.priceString,
});

/** native-only (iOS/Android) — לא נבנה לעולם ל-web, ראה nativeGateway.web.ts. */
export const createNativeRevenueCatGateway = (): RevenueCatGateway => {
  let packages: PurchasesPackage[] = [];

  return {
    kind: 'native',
    async configure() {
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
      if (!apiKey) throw new RevenueCatNotConfiguredError();
      Purchases.configure({ apiKey });
    },
    async getPackages() {
      const offerings = await Purchases.getOfferings();
      packages = offerings.current?.availablePackages ?? [];
      return packages.map(toPackage);
    },
    async purchase(packageIdentifier) {
      const target = packages.find((pkg) => pkg.identifier === packageIdentifier);
      if (!target) throw new Error(`Unknown RevenueCat package: ${packageIdentifier}`);
      const { customerInfo } = await Purchases.purchasePackage(target);
      return toStatus(customerInfo);
    },
    async restorePurchases() {
      const customerInfo = await Purchases.restorePurchases();
      return toStatus(customerInfo);
    },
    async getCustomerStatus() {
      const customerInfo = await Purchases.getCustomerInfo();
      return toStatus(customerInfo);
    },
    onCustomerStatusChange(listener) {
      const wrapped = (info: CustomerInfo) => listener(toStatus(info));
      Purchases.addCustomerInfoUpdateListener(wrapped);
      return () => Purchases.removeCustomerInfoUpdateListener(wrapped);
    },
  };
};
