import { describe, expect, it } from 'vitest';

import { formatHltbHours } from './formatHours';
import { createHttpHltbGateway } from './httpGateway';
import { createMockHltbGateway } from './mockGateway';

describe('mock HLTB gateway', () => {
  const gateway = createMockHltbGateway();

  it('returns nothing for an empty query', async () => {
    expect(await gateway.search('   ')).toEqual([]);
  });

  it('matches case-insensitively on a substring', async () => {
    const results = await gateway.search('zelda');
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toContain('Breath of the Wild');
  });
});

describe('http HLTB gateway', () => {
  it('returns the normalized results from the proxy', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify([
          {
            hltbId: 3877,
            name: 'Hades',
            mainStoryMinutes: 1320,
            mainExtraMinutes: 2220,
            completionistMinutes: 3720,
          },
        ]),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )) as typeof globalThis.fetch;

    try {
      const gateway = createHttpHltbGateway('https://example.test');
      const [match] = await gateway.search('hades');
      expect(match).toEqual({
        hltbId: 3877,
        name: 'Hades',
        mainStoryMinutes: 1320,
        mainExtraMinutes: 2220,
        completionistMinutes: 3720,
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('surfaces the proxy error message when the request fails', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: 'HLTB search responded 502' }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      })) as typeof globalThis.fetch;

    try {
      const gateway = createHttpHltbGateway('https://example.test');
      await expect(gateway.search('hades')).rejects.toThrow('HLTB search responded 502');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('formatHltbHours', () => {
  it('returns null when there is no data', () => {
    expect(formatHltbHours(null)).toBeNull();
  });

  it('formats whole hours without a decimal', () => {
    expect(formatHltbHours(120)).toBe('2h');
  });

  it('rounds to the nearest half hour', () => {
    expect(formatHltbHours(100)).toBe('1.5h');
  });
});
