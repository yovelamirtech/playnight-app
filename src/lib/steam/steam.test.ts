import { describe, expect, it } from 'vitest';

import { createHttpSteamGateway } from './httpGateway';
import { createMockSteamGateway } from './mockGateway';
import { SteamImportError } from './types';

describe('mock Steam gateway', () => {
  const gateway = createMockSteamGateway();

  it('rejects an empty vanity URL', async () => {
    await expect(gateway.resolveVanityUrl('  ')).rejects.toThrow(SteamImportError);
  });

  it('resolves a vanity URL to the fixture steam id', async () => {
    const steamId = await gateway.resolveVanityUrl('someplayer');
    expect(steamId).toBe('76561197960287930');
  });

  it('returns the owned games for the fixture steam id', async () => {
    const steamId = await gateway.resolveVanityUrl('someplayer');
    const games = await gateway.getOwnedGames(steamId);
    expect(games.map((g) => g.name)).toContain('Portal 2');
  });

  it('returns nothing for an unknown steam id', async () => {
    expect(await gateway.getOwnedGames('0')).toEqual([]);
  });
});

describe('http Steam gateway', () => {
  it('normalizes a raw owned-games payload', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          games: [{ appid: 620, name: 'Portal 2', playtime_forever: 734 }],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )) as typeof globalThis.fetch;

    try {
      const gateway = createHttpSteamGateway('https://example.test');
      const [game] = await gateway.getOwnedGames('76561197960287930');
      expect(game).toEqual({
        appId: 620,
        name: 'Portal 2',
        playtimeMinutes: 734,
        coverUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/620/header.jpg',
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('surfaces the proxy error message when Steam rejects the request', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: 'Steam profile "ghost" not found' }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      })) as typeof globalThis.fetch;

    try {
      const gateway = createHttpSteamGateway('https://example.test');
      await expect(gateway.resolveVanityUrl('ghost')).rejects.toThrow('Steam profile "ghost" not found');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
