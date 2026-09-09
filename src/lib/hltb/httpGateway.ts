import { HLTB_PROXY_URL } from './config';
import { HltbNotConfiguredError } from './types';
import type { HltbGateway, HltbMatch } from './types';

async function getJson(baseUrl: string, path: string): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json().catch(() => []);
  if (!response.ok) {
    const message = (body as { error?: string }).error ?? `HLTB proxy responded ${response.status}`;
    throw new Error(message);
  }
  return body;
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
