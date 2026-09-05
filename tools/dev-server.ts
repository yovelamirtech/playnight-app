import { networkInterfaces } from 'node:os';
import { join } from 'node:path';

import { createCoepProxy } from './dev-web/coepProxy';
import { createIgdbProxy } from './igdb-proxy/server';
import { createTagger } from './tagger/server';

/**
 * תהליך העזר היחיד של הפיתוח. הרצה:  npm run dev
 *
 *   1. פרוקסי IGDB   (8787)  — מחזיק את הסודות במקום האפליקציה
 *   2. שכבת web      (8091)  — כותרות שבלעדיהן SQLite לא רץ בדפדפן
 *   3. כלי תיוג      (8788)  — בניית ה-seed הידני (§4.5)
 *
 * במקביל, בטרמינל שני:  npx expo start
 */
const IGDB_PORT = Number(process.env.IGDB_PROXY_PORT ?? 8787);
const WEB_PORT = Number(process.env.DEV_WEB_PORT ?? 8091);
const TAGGER_PORT = Number(process.env.TAGGER_PORT ?? 8788);
const EXPO_PORT = Number(process.env.EXPO_PORT ?? 8081);
const QUEUE_SIZE = Number(process.env.TAGGER_QUEUE_SIZE ?? 300);

const credentials = {
  clientId: process.env.IGDB_CLIENT_ID ?? '',
  clientSecret: process.env.IGDB_CLIENT_SECRET ?? '',
};

if (!credentials.clientId || !credentials.clientSecret) {
  console.error('Missing IGDB_CLIENT_ID / IGDB_CLIENT_SECRET.');
  console.error('Run this through "npm run dev" so .env is loaded.');
  process.exit(1);
}

const lanAddress = (): string =>
  Object.values(networkInterfaces())
    .flat()
    .find((entry) => entry && entry.family === 'IPv4' && !entry.internal)?.address ?? 'localhost';

createIgdbProxy({ credentials, port: IGDB_PORT }).listen();
createCoepProxy({ port: WEB_PORT, targetPort: EXPO_PORT }).listen();
createTagger({
  credentials,
  port: TAGGER_PORT,
  seedPath: join(process.cwd(), 'seed', 'session-profiles.json'),
  queueSize: QUEUE_SIZE,
}).listen();

console.log(`
  PlayNight dev helpers are running.

  IGDB proxy    http://localhost:${IGDB_PORT}
  Session tagger  http://localhost:${TAGGER_PORT}     <- open this to tag games
  Web wrapper   http://localhost:${WEB_PORT}  ->  Expo on ${EXPO_PORT}

  In a second terminal:   npx expo start

  Phone on the same Wi-Fi needs this in .env:
      EXPO_PUBLIC_IGDB_PROXY_URL=http://${lanAddress()}:${IGDB_PORT}
`);
