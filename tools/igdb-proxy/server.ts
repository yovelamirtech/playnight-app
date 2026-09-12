import { createServer } from 'node:http';

import { searchHltb } from './hltb';
import { searchGames } from './igdb';
import { getOwnedGames, resolveVanityUrl } from './steam';
import type { SteamCredentials } from './steam';
import type { IgdbCredentials } from './token';
import { sendJson as sendJsonRaw } from '../httpUtil';

/**
 * פרוקסי פיתוח ל-IGDB.
 *
 * הסודות לא נכנסים לאפליקציה — היא מדברת רק מול השרת הזה.
 * בשלב 4 אותו חוזה (GET /search?q=) עובר ל-Supabase Edge Function,
 * וכל מה שמשתנה באפליקציה הוא EXPO_PUBLIC_IGDB_PROXY_URL.
 *
 * האפליקציה עשויה לרוץ בדפדפן בפיתוח, שם fetch כפוף ל-CORS — כלי פיתוח
 * בלבד, לא נחשף החוצה, לכן תמיד עם Access-Control-Allow-Origin.
 */
const sendJson = (res: Parameters<typeof sendJsonRaw>[0], status: number, payload: unknown): void =>
  sendJsonRaw(res, status, payload, { cors: true });

export function createIgdbProxy({
  credentials,
  steamCredentials,
  port,
}: {
  credentials: IgdbCredentials;
  steamCredentials: SteamCredentials | null;
  port: number;
}) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

    if (url.pathname === '/health') return sendJson(res, 200, { ok: true });

    if (url.pathname === '/search') {
      const query = url.searchParams.get('q')?.trim();
      if (!query) return sendJson(res, 200, []);

      try {
        const results = await searchGames({
          query,
          limit: Number(url.searchParams.get('limit') ?? 20),
          credentials,
        });
        console.log(`  igdb: "${query}" -> ${results.length} result(s)`);
        return sendJson(res, 200, results);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  igdb: ${message}`);
        return sendJson(res, 502, { error: message });
      }
    }

    if (url.pathname === '/steam/resolve' || url.pathname === '/steam/games') {
      if (!steamCredentials) {
        return sendJson(res, 501, { error: 'Steam API key not configured (STEAM_API_KEY in .env)' });
      }

      try {
        if (url.pathname === '/steam/resolve') {
          const vanityUrl = url.searchParams.get('vanityUrl')?.trim();
          if (!vanityUrl) return sendJson(res, 400, { error: 'Missing vanityUrl' });
          const steamId = await resolveVanityUrl(vanityUrl, steamCredentials);
          console.log(`  steam: resolved "${vanityUrl}" -> ${steamId}`);
          return sendJson(res, 200, { steamId });
        }

        const steamId = url.searchParams.get('steamId')?.trim();
        if (!steamId) return sendJson(res, 400, { error: 'Missing steamId' });
        const games = await getOwnedGames(steamId, steamCredentials);
        console.log(`  steam: ${steamId} -> ${games.length} game(s)`);
        return sendJson(res, 200, { games });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  steam: ${message}`);
        return sendJson(res, 502, { error: message });
      }
    }

    if (url.pathname === '/hltb/search') {
      const query = url.searchParams.get('q')?.trim();
      if (!query) return sendJson(res, 200, []);

      try {
        const results = await searchHltb(query);
        console.log(`  hltb: "${query}" -> ${results.length} result(s)`);
        return sendJson(res, 200, results);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  hltb: ${message}`);
        return sendJson(res, 502, { error: message });
      }
    }

    return sendJson(res, 404, { error: 'Not found' });
  });

  return { server, listen: () => server.listen(port, '0.0.0.0') };
}
