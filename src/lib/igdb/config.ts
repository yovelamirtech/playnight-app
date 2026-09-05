/**
 * ה-Secrets של IGDB לא נכנסים לבאנדל. הקליינט תמיד מדבר מול פרוקסי
 * שמחזיק אותם בצד שרת (שלב 4: Supabase Edge Function).
 * המעבר בין סביבות הוא החלפת ה-URL הזה בלבד.
 */
export const IGDB_PROXY_URL = process.env.EXPO_PUBLIC_IGDB_PROXY_URL ?? null;

export const isIgdbConfigured = (): boolean => Boolean(IGDB_PROXY_URL);
