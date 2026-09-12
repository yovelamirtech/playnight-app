/** חבילת מנוי בודדת (SPEC §5 — חודשי/שנתי), מנורמלת מ-offerings של RevenueCat. */
export type SubscriptionPackage = {
  identifier: string;
  /** 'monthly' | 'annual' | ... — לפי מזהה החבילה ב-RevenueCat dashboard. */
  period: string;
  priceString: string;
};

export type CustomerStatus = {
  isPro: boolean;
};

/**
 * הממשק היחיד שה-UI/repositories מכירים. RevenueCat הוא native module —
 * מקור האמת המקומי הוא `users.isPro` ב-SQLite (AGENTS.md כלל 4); ה-gateway
 * הזה רק מזין אותו ומבצע רכישות.
 */
export interface RevenueCatGateway {
  readonly kind: 'mock' | 'native';
  configure(): Promise<void>;
  getPackages(): Promise<SubscriptionPackage[]>;
  purchase(packageIdentifier: string): Promise<CustomerStatus>;
  restorePurchases(): Promise<CustomerStatus>;
  getCustomerStatus(): Promise<CustomerStatus>;
  onCustomerStatusChange(listener: (status: CustomerStatus) => void): () => void;
}

export class RevenueCatNotConfiguredError extends Error {
  constructor() {
    super('RevenueCat gateway is not configured');
    this.name = 'RevenueCatNotConfiguredError';
  }
}
