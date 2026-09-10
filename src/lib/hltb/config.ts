/**
 * HLTB חולק את אותו פרוקסי פיתוח (tools/dev-server.ts) כמו IGDB/Steam —
 * אותו משתנה סביבה, אין סוד ייעודי (§4 החלטה #2, אותו עיקרון).
 */
export const HLTB_PROXY_URL = process.env.EXPO_PUBLIC_IGDB_PROXY_URL ?? null;

export const isHltbConfigured = (): boolean => Boolean(HLTB_PROXY_URL);
