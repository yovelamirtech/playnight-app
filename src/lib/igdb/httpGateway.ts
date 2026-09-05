import { IGDB_PROXY_URL } from './config';
import { IgdbNotConfiguredError } from './types';
import type { IgdbGame, IgdbGateway, IgdbSearchOptions } from './types';

type RawIgdbGame = {
  id: number;
  name: string;
  cover?: { url?: string };
  first_release_date?: number;
  genres?: { name: string }[];
  platforms?: { abbreviation?: string; name: string }[];
  total_rating?: number;
  themes?: { name: string }[];
  keywords?: { name: string }[];
};

const toCoverUrl = (raw: RawIgdbGame): string | null => {
  const url = raw.cover?.url;
  if (!url) return null;
  return `https:${url.replace('t_thumb', 't_cover_big')}`;
};

const normalize = (raw: RawIgdbGame): IgdbGame => ({
  igdbId: raw.id,
  name: raw.name,
  coverUrl: toCoverUrl(raw),
  releaseYear: raw.first_release_date
    ? new Date(raw.first_release_date * 1000).getUTCFullYear()
    : null,
  genres: raw.genres?.map((g) => g.name) ?? [],
  platforms: raw.platforms?.map((p) => p.abbreviation ?? p.name) ?? [],
  communityRating: typeof raw.total_rating === 'number' ? raw.total_rating : null,
  themes: raw.themes?.map((t) => t.name) ?? [],
  keywords: raw.keywords?.map((k) => k.name) ?? [],
});

export const createHttpIgdbGateway = (baseUrl: string): IgdbGateway => ({
  kind: 'http',
  async searchGames(query, options: IgdbSearchOptions = {}) {
    if (!baseUrl) throw new IgdbNotConfiguredError();
    const params = new URLSearchParams({ q: query, limit: String(options.limit ?? 20) });
    const response = await fetch(`${baseUrl}/search?${params.toString()}`, {
      signal: options.signal,
    });
    if (!response.ok) {
      throw new Error(`IGDB proxy responded ${response.status}`);
    }
    const raw = (await response.json()) as RawIgdbGame[];
    return raw.map(normalize);
  },
});

export const igdbProxyGateway = (): IgdbGateway => {
  if (!IGDB_PROXY_URL) throw new IgdbNotConfiguredError();
  return createHttpIgdbGateway(IGDB_PROXY_URL);
};
