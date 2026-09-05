import { createServer, request as httpRequest } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Duplex } from 'node:stream';
import { connect } from 'node:net';

/**
 * expo-sqlite רץ ב-web על WebAssembly, ולשם כך הוא צריך SharedArrayBuffer.
 * דפדפנים נותנים SharedArrayBuffer רק לעמוד "cross-origin isolated", כלומר
 * עמוד שה-HTML שלו הגיע עם שתי הכותרות למטה.
 *
 * שרת הפיתוח של Expo לא מאפשר להוסיף כותרות ל-HTML עצמו (אין hook כזה),
 * ולכן אנחנו יושבים לפניו ומוסיפים אותן בדרך החוצה.
 *
 * זה כלי פיתוח בלבד. הוא לא נוגע באפליקציה ולא נכנס לשום build.
 */
const ISOLATION_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  // כל מה שעובר דרך השכבה הזאת הוא מקומי ומותר להיטען בהקשר המבודד.
  'Cross-Origin-Resource-Policy': 'cross-origin',
};

type CoepProxyOptions = { port: number; targetPort: number; targetHost?: string };

export function createCoepProxy({ port, targetPort, targetHost = '127.0.0.1' }: CoepProxyOptions) {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const upstream = httpRequest(
      { host: targetHost, port: targetPort, path: req.url, method: req.method, headers: req.headers },
      (upstreamRes) => {
        res.writeHead(upstreamRes.statusCode ?? 502, {
          ...upstreamRes.headers,
          ...ISOLATION_HEADERS,
        });
        upstreamRes.pipe(res);
      },
    );

    upstream.on('error', () => {
      if (res.headersSent) return res.destroy();
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end(`Cannot reach the Expo dev server on port ${targetPort}.\nRun: npx expo start --web`);
    });

    req.pipe(upstream);
  });

  // Metro's hot reload runs over a websocket, so the upgrade has to pass through too.
  server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const upstream = connect(targetPort, targetHost, () => {
      const lines = [`${req.method} ${req.url} HTTP/1.1`];
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
      }
      upstream.write(`${lines.join('\r\n')}\r\n\r\n`);
      if (head?.length) upstream.write(head);
      upstream.pipe(socket);
      socket.pipe(upstream);
    });
    upstream.on('error', () => socket.destroy());
    socket.on('error', () => upstream.destroy());
  });

  return { server, listen: () => server.listen(port, '0.0.0.0') };
}
