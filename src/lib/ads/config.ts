/**
 * §5/§8 — פרסומות באנר. אותו עיקרון כמו RevenueCat/Supabase
 * (`src/lib/revenuecat/config.ts`): מפתחות אמיתיים אופציונליים ב-`.env`,
 * ובלעדיהם נופלים בחזרה למזהי הבדיקה הרשמיים של Google (`TestIds` מהחבילה
 * עצמה) — כך שבפיתוח/Dev Build בלי חשבון AdMob עדיין רואים פרסומת בדיקה
 * אמיתית, לא כלום. `app.json` (plugin) משתמש כרגע ב-App ID של בדיקה של
 * Google — יוחלף במזהה האמיתי כשייווצר חשבון AdMob (ראה HANDOFF.md).
 */
export const ADMOB_ANDROID_BANNER_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_UNIT_ID ?? null;
export const ADMOB_IOS_BANNER_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_UNIT_ID ?? null;

export const isAdsConfigured = (): boolean =>
  Boolean(ADMOB_ANDROID_BANNER_UNIT_ID || ADMOB_IOS_BANNER_UNIT_ID);
