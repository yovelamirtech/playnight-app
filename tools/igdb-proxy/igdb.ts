import { getAccessToken } from './token';
import type { IgdbCredentials } from './token';

const IGDB_URL = 'https://api.igdb.com/v4/games';

export type RawIgdbGame = {
  id: number;
  name: string;
  cover?: { url?: string };
  first_release_date?: number;
  genres?: { name: string }[];
  themes?: { name: string }[];
  keywords?: { name: string }[];
  platforms?: { abbreviation?: string; name: string }[];
  total_rating?: number;
  total_rating_count?: number;
};

/**
 * השדות שהאפליקציה צריכה. keywords ו-themes מזינים את מיפוי
 * הארכיטיפים ב-src/lib/sessionProfile (§4.4) — אל תוריד אותם.
 */
const FIELDS = [
  'id',
  'name',
  'cover.url',
  'first_release_date',
  'genres.name',
  'platforms.abbreviation',
  'platforms.name',
  'total_rating',
  'total_rating_count',
  'themes.name',
  'keywords.name',
].join(',');

const BACKSLASH = String.fromCharCode(92);
// apicalypse strings are quote-delimited: strip anything that could close one early.
const escapeQuery = (value: string): string =>
  value.split('"').join('').split(BACKSLASH).join('');

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

async function query(body: string, credentials: IgdbCredentials): Promise<RawIgdbGame[]> {
  const token = await getAccessToken(credentials);
  const response = await fetch(IGDB_URL, {
    method: 'POST',
    headers: {
      'Client-ID': credentials.clientId,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`IGDB request failed (${response.status}): ${await response.text()}`);
  }
  return (await response.json()) as RawIgdbGame[];
}

export function searchGames(args: {
  query: string;
  limit: number;
  credentials: IgdbCredentials;
}): Promise<RawIgdbGame[]> {
  const body = [
    `search "${escapeQuery(args.query)}";`,
    `fields ${FIELDS};`,
    `limit ${clamp(args.limit, 1, 50)};`,
  ].join('\n');
  return query(body, args.credentials);
}

/**
 * "פופולריות" = כמה אנשים טרחו לדרג את המשחק.
 * זה הקירוב הטוב ביותר ל"כמה אנשים מחזיקים אותו" שיש ב-IGDB,
 * והוא בדיוק מה שאנחנו רוצים לכסות ב-seed (§4.5).
 */
export function topGames(args: {
  limit: number;
  offset: number;
  credentials: IgdbCredentials;
}): Promise<RawIgdbGame[]> {
  const body = [
    `fields ${FIELDS};`,
    // אין `category = 0`: IGDB מחזירה אפס תוצאות עבורו כשמבקשים
    // את מלוא השדות. version_parent מסנן ממילא מהדורות ופורטים.
    'where total_rating_count > 40 & version_parent = null;',
    'sort total_rating_count desc;',
    `limit ${clamp(args.limit, 1, 500)};`,
    `offset ${Math.max(args.offset, 0)};`,
  ].join('\n');
  return query(body, args.credentials);
}
