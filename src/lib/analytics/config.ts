/**
 * §8 שלב 4 — PostHog. אופציונלי לגמרי, אותו עיקרון כמו Supabase/RevenueCat
 * (ראה `src/lib/supabase/config.ts`): ריק = הפיצ'ר לא זמין, האפליקציה
 * ממשיכה בלי לגעת ב-SDK בכלל.
 */
export const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? null;
export const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

export const isPostHogConfigured = (): boolean => Boolean(POSTHOG_API_KEY);
