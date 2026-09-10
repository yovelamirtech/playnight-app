/**
 * §8 שלב 4 — Supabase Auth + sync. שלא כמו IGDB/Steam, אין כאן פרוקסי:
 * ה-anon key מיועד להיות ציבורי, ההגנה היא Row Level Security בצד השרת
 * (supabase/migrations). ריק = האפליקציה נשארת אופליין לגמרי (§6.4 ב-AGENTS.md).
 */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? null;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? null;

export const isSupabaseConfigured = (): boolean => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
