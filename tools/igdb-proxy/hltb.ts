const HLTB_ORIGIN = 'https://howlongtobeat.com';
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Referer: `${HLTB_ORIGIN}/`,
  Origin: HLTB_ORIGIN,
};

export type HltbMatch = {
  hltbId: number;
  name: string;
  /** דקות. null = HLTB לא מחזיק את הנתון הזה למשחק. */
  mainStoryMinutes: number | null;
  mainExtraMinutes: number | null;
  completionistMinutes: number | null;
};

export class HltbApiError extends Error {}

const hoursToMinutes = (hours: number): number | null =>
  hours > 0 ? Math.round(hours * 60) : null;

type RawHltbEntry = {
  game_id: number;
  game_name: string;
  comp_main: number; // שעות עשרוניות
  comp_plus: number;
  comp_100: number;
};

/**
 * HLTB לא חושף API רשמי. נקודת הכניסה נבנית דינמית מהחבילה שהאתר טוען —
 * מפוצלת למחרוזות בקוד כדי להקשות על scraping, ומשתנה מדי כמה חודשים.
 * זה בדיוק הטכניקה שספריות קהילתיות (howlongtobeat.py, node-hltb) משתמשות
 * בה. אם HLTB משנה את השיטה — הפונקציה הזו זורקת, וה-caller (§ למטה,
 * hltbRepo) בולע את זה כ"אין נתון", בדיוק כמו seed override חסר (§4 החלטה #6).
 */
async function resolveSearchPath(): Promise<string> {
  const homeResponse = await fetch(HLTB_ORIGIN, { headers: BROWSER_HEADERS });
  if (!homeResponse.ok) {
    throw new HltbApiError(`HLTB homepage responded ${homeResponse.status}`);
  }
  const html = await homeResponse.text();

  const scriptMatches = [...html.matchAll(/_next\/static\/chunks\/pages\/_app-[a-f0-9]+\.js/g)].map(
    (match) => match[0],
  );
  if (scriptMatches.length === 0) {
    throw new HltbApiError('Could not locate HLTB app bundle script');
  }

  for (const scriptPath of scriptMatches) {
    const scriptResponse = await fetch(`${HLTB_ORIGIN}/${scriptPath}`, { headers: BROWSER_HEADERS });
    if (!scriptResponse.ok) continue;
    const script = await scriptResponse.text();

    const fragments = [...script.matchAll(/\/api\/search\/"\.concat\("([^"]+)"\)/g)].map(
      (match) => match[1],
    );
    if (fragments.length > 0) {
      return `/api/search/${fragments.join('')}`;
    }
  }

  throw new HltbApiError('Could not extract HLTB search API path from app bundle');
}

let cachedSearchPath: { path: string; expiresAt: number } | null = null;

async function getSearchPath(): Promise<string> {
  if (cachedSearchPath && cachedSearchPath.expiresAt > Date.now()) {
    return cachedSearchPath.path;
  }
  const path = await resolveSearchPath();
  cachedSearchPath = { path, expiresAt: Date.now() + 60 * 60 * 1000 };
  return path;
}

export async function searchHltb(query: string): Promise<HltbMatch[]> {
  const path = await getSearchPath();

  const response = await fetch(`${HLTB_ORIGIN}${path}`, {
    method: 'POST',
    headers: { ...BROWSER_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchType: 'games',
      searchTerms: query.trim().split(/\s+/),
      searchPage: 1,
      size: 10,
      searchOptions: {
        games: {
          userId: 0,
          platform: '',
          sortCategory: 'popular',
          rangeCategory: 'main',
          rangeTime: { min: 0, max: 0 },
          gameplay: { perspective: '', flow: '', genre: '', difficulty: '' },
          rangeYear: { min: '', max: '' },
          modifier: '',
        },
        users: { sortCategory: 'postcount' },
        lists: { sortCategory: 'follows' },
        filter: '',
        sort: 0,
        randomizer: 0,
      },
      useCache: true,
    }),
  });

  if (!response.ok) {
    // הנתיב שחילצנו יכול להתיישן — ננקה את המטמון כדי שהניסיון הבא יחלץ מחדש.
    cachedSearchPath = null;
    throw new HltbApiError(`HLTB search responded ${response.status}`);
  }

  const body = (await response.json()) as { data?: RawHltbEntry[] };
  return (body.data ?? []).map((entry) => ({
    hltbId: entry.game_id,
    name: entry.game_name,
    mainStoryMinutes: hoursToMinutes(entry.comp_main),
    mainExtraMinutes: hoursToMinutes(entry.comp_plus),
    completionistMinutes: hoursToMinutes(entry.comp_100),
  }));
}
