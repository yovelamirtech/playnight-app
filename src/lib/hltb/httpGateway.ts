import { fetchJson } from '@/lib/httpJson';

import { HLTB_PROXY_URL } from './config';
import { HltbNotConfiguredError } from './types';
import type { HltbGateway, HltbMatch } from './types';

async function getJson(baseUrl: string, path: string): Promise<unknown> {
  return fetchJson(
    `${baseUrl}${path}`,
    undefined,
    (status, body) => {
      const message = (body as { error?: string }).error ?? `HLTB proxy responded ${status}`;
      throw new Error(message);
    },
    { fallback: [] }
  );
}

export const createHttpHltbGateway = (baseUrl: string): HltbGateway => ({
  kind: 'http',
  async search(query) {
    const params = new URLSearchParams({ q: query });
    const results = (await getJson(baseUrl, `/hltb/search?${params.toString()}`)) as HltbMatch[];
    return results;
  },
});

export const hltbProxyGateway = (): HltbGateway => {
  if (!HLTB_PROXY_URL) throw new HltbNotConfiguredError();
  return createHttpHltbGateway(HLTB_PROXY_URL);
};
