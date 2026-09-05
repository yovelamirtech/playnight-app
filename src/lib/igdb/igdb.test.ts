import { describe, expect, it } from 'vitest';

import { createHttpIgdbGateway } from './httpGateway';
import { createMockIgdbGateway } from './mockGateway';

describe('mock IGDB gateway', () => {
  const gateway = createMockIgdbGateway();

  it('returns nothing for an empty query', async () => {
    expect(await gateway.searchGames('   ')).toEqual([]);
  });

  it('matches case-insensitively on a substring', async () => {
    const results = await gateway.searchGames('zelda');
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toContain('Breath of the Wild');
  });

  it('respects the limit option', async () => {
    const results = await gateway.searchGames('a', { limit: 2 });
    expect(results).toHaveLength(2);
  });
});

describe('http IGDB gateway', () => {
  it('normalizes a raw IGDB payload', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify([
          {
            id: 42,
            name: 'Test Game',
            cover: { url: '//images.igdb.com/igdb/image/upload/t_thumb/abc.jpg' },
            first_release_date: 1_500_000_000,
            genres: [{ name: 'Puzzle' }],
            platforms: [{ abbreviation: 'PC', name: 'PC (Microsoft Windows)' }],
            total_rating: 77.5,
            themes: [{ name: 'Fantasy' }],
            keywords: [{ name: 'roguelike' }, { name: 'netflix' }],
          },
        ]),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )) as typeof globalThis.fetch;

    try {
      const gateway = createHttpIgdbGateway('https://example.test');
      const [game] = await gateway.searchGames('test');
      expect(game).toEqual({
        igdbId: 42,
        name: 'Test Game',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/abc.jpg',
        releaseYear: 2017,
        genres: ['Puzzle'],
        platforms: ['PC'],
        communityRating: 77.5,
        themes: ['Fantasy'],
        keywords: ['roguelike', 'netflix'],
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
