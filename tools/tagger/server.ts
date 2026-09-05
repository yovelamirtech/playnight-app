import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';

import type { IgdbCredentials } from '../igdb-proxy/token';
import { buildQueue } from './queue';
import type { TagCandidate } from './queue';
import { loadSeed, saveSeed, upsertEntry } from './store';
import type { SeedEntry } from './store';

const PAGE = join(import.meta.dirname, 'page.html');

const sendJson = (res: ServerResponse, status: number, payload: unknown): void => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
};

const readBody = async (req: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
};

export function createTagger(args: {
  credentials: IgdbCredentials;
  port: number;
  seedPath: string;
  queueSize: number;
}) {
  let queue: TagCandidate[] | null = null;

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

    if (url.pathname === '/') {
      const html = readFileSync(PAGE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    if (url.pathname === '/queue') {
      try {
        // נטען פעם אחת ונשמר בזיכרון: רענון הדף לא מבזבז קריאות ל-IGDB.
        queue ??= await buildQueue({ size: args.queueSize, credentials: args.credentials });
        const done = new Set(loadSeed(args.seedPath).entries.map((entry) => entry.igdbId));
        return sendJson(res, 200, {
          total: queue.length,
          taggedCount: queue.filter((game) => done.has(game.igdbId)).length,
          games: queue.filter((game) => !done.has(game.igdbId)),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return sendJson(res, 502, { error: message });
      }
    }

    if (url.pathname === '/tag' && req.method === 'POST') {
      const entry = (await readBody(req)) as SeedEntry;
      const seed = upsertEntry(loadSeed(args.seedPath), { ...entry, taggedAt: new Date().toISOString() });
      saveSeed(args.seedPath, seed);
      console.log(`  tagged ${seed.entries.length}: ${entry.name}`);
      return sendJson(res, 200, { ok: true, taggedCount: seed.entries.length });
    }

    return sendJson(res, 404, { error: 'Not found' });
  });

  return { server, listen: () => server.listen(args.port, '127.0.0.1') };
}
