import { createServer } from 'node:http';
import type { ServerResponse } from 'node:http';

import { searchGames } from './igdb';
import type { IgdbCredentials } from './token';

/**
 * פרוקסי פיתוח ל-IGDB.
 *
 * הסודות לא נכנסים לאפליקציה — היא מדברת רק מול השרת הזה.
 * בשלב 4 אותו חוזה (GET /search?q=) עובר ל-Supabase Edge Function,
 * וכל מה שמשתנה באפליקציה הוא EXPO_PUBLIC_IGDB_PROXY_URL.
 */
const sendJson = (res: ServerResponse, status: number, payload: unknown): void => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    // האפליקציה עשויה לרוץ בדפדפן בפיתוח, שם fetch כפוף ל-CORS.
    // כלי פיתוח בלבד, לא נחשף החוצה.
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
};

export function createIgdbProxy({ credentials, port }: { credentials: IgdbCredentials; port: number }) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

    if (url.pathname === '/health') return sendJson(res, 200, { ok: true });
    if (url.pathname !== '/search') return sendJson(res, 404, { error: 'Not found' });

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
  });

  return { server, listen: () => server.listen(port, '0.0.0.0') };
}
