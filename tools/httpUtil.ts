import type { ServerResponse } from 'node:http';

/** כותב תשובת JSON ל-node:http response. cors=true מוסיף Access-Control-Allow-Origin. */
export const sendJson = (
  res: ServerResponse,
  status: number,
  payload: unknown,
  options: { cors?: boolean } = {}
): void => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...(options.cors ? { 'Access-Control-Allow-Origin': '*' } : {}),
  });
  res.end(body);
};
