import { resolveSessionProfile } from '../../src/lib/sessionProfile/archetype';
import { topGames } from '../igdb-proxy/igdb';
import type { RawIgdbGame } from '../igdb-proxy/igdb';
import type { IgdbCredentials } from '../igdb-proxy/token';

export type TagCandidate = {
  igdbId: number;
  name: string;
  releaseYear: number | null;
  coverUrl: string | null;
  genres: string[];
  themes: string[];
  keywords: string[];
  ratingCount: number;
  guess: {
    archetype: string | null;
    source: string;
    typicalMinutes: number;
    interruptible: boolean;
  };
};

const coverUrl = (game: RawIgdbGame): string | null =>
  game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null;

/**
 * בונה את התור לתיוג. הניחוש מגיע מאותה פונקציה טהורה שהאפליקציה
 * משתמשת בה (§4.4) — אין כאן עותק שני של טבלת המיפוי.
 */
export async function buildQueue(args: {
  size: number;
  credentials: IgdbCredentials;
}): Promise<TagCandidate[]> {
  const candidates: TagCandidate[] = [];
  const pageSize = 200;

  for (let offset = 0; candidates.length < args.size; offset += pageSize) {
    const page = await topGames({ limit: pageSize, offset, credentials: args.credentials });
    if (page.length === 0) break;

    for (const game of page) {
      const genres = game.genres?.map((entry) => entry.name) ?? [];
      const themes = game.themes?.map((entry) => entry.name) ?? [];
      const keywords = game.keywords?.map((entry) => entry.name) ?? [];
      const profile = resolveSessionProfile({ genres, themes, keywords });

      candidates.push({
        igdbId: game.id,
        name: game.name,
        releaseYear: game.first_release_date
          ? new Date(game.first_release_date * 1000).getUTCFullYear()
          : null,
        coverUrl: coverUrl(game),
        genres,
        themes,
        keywords,
        ratingCount: game.total_rating_count ?? 0,
        guess: {
          archetype: profile.archetype,
          source: profile.source,
          typicalMinutes: profile.typicalMinutes,
          interruptible: profile.interruptible,
        },
      });
    }
  }

  return candidates.slice(0, args.size);
}
