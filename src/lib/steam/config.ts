/**
 * Steam ו-IGDB חולקים את אותו פרוקסי פיתוח (tools/dev-server.ts, פורט אחד) —
 * ולכן את אותו משתנה סביבה. הסודות עצמם (STEAM_API_KEY) לא נכנסים לבאנדל.
 */
export const STEAM_PROXY_URL = process.env.EXPO_PUBLIC_IGDB_PROXY_URL ?? null;

export const isSteamConfigured = (): boolean => Boolean(STEAM_PROXY_URL);
