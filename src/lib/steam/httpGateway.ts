import { fetchJson } from '@/lib/httpJson';

import { STEAM_PROXY_URL } from './config';
import { SteamImportError, SteamNotConfiguredError } from './types';
import type { SteamGateway, SteamOwnedGame } from './types';

type RawSteamGame = {
  appid: number;
  name: string;
  playtime_forever: number;
};

const toCoverUrl = (appId: number): string =>
  `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;

const normalize = (raw: RawSteamGame): SteamOwnedGame => ({
  appId: raw.appid,
  name: raw.name,
  playtimeMinutes: raw.playtime_forever,
  coverUrl: toCoverUrl(raw.appid),
});

async function getJson(baseUrl: string, path: string): Promise<unknown> {
  return fetchJson(
    `${baseUrl}${path}`,
    undefined,
    (status, body) => {
      throw new SteamImportError((body as { error?: string }).error ?? `Steam proxy responded ${status}`);
    },
    { fallback: {} }
  );
}

export const createHttpSteamGateway = (baseUrl: string): SteamGateway => ({
  kind: 'http',
  async resolveVanityUrl(vanityUrl) {
    const params = new URLSearchParams({ vanityUrl });
    const body = (await getJson(baseUrl, `/steam/resolve?${params.toString()}`)) as {
      steamId: string;
    };
    return body.steamId;
  },
  async getOwnedGames(steamId) {
    const params = new URLSearchParams({ steamId });
    const body = (await getJson(baseUrl, `/steam/games?${params.toString()}`)) as {
      games: RawSteamGame[];
    };
    return body.games.map(normalize);
  },
});

export const steamProxyGateway = (): SteamGateway => {
  if (!STEAM_PROXY_URL) throw new SteamNotConfiguredError();
  return createHttpSteamGateway(STEAM_PROXY_URL);
};
