/**
 * §8 שלב 4 — RevenueCat. אופציונלי לגמרי, אותו עיקרון כמו Supabase
 * (`src/lib/supabase/config.ts`): ריק = הפיצ'ר לא זמין, האפליקציה ממשיכה
 * בלי לגעת ב-SDK בכלל. שני מפתחות (לא אחד) כי RevenueCat מנפיק מפתח
 * ציבורי נפרד לכל חנות.
 */
export const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? null;
export const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? null;

export const isRevenueCatConfigured = (): boolean =>
  Boolean(REVENUECAT_IOS_KEY || REVENUECAT_ANDROID_KEY);
