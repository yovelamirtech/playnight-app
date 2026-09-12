import { eq } from 'drizzle-orm';

import { canAddGame } from '@/lib/entitlements/limits';
import type { IgdbGame } from '@/lib/igdb';
import { igdbGameId, localGameId, newId } from '@/lib/id';
import { resolveSessionProfile } from '@/lib/sessionProfile/archetype';
import { getSeedOverride } from '@/lib/sessionProfile/seedOverrides';

import { LOCAL_USER_ID } from '../bootstrap';
import { db } from '../client';
import { games, userGames } from '../schema';
import type { UserGameStatus } from '../schema';
import { enrichGameWithHltb } from './hltbRepo';
import { getIsPro } from './proRepo';

export type LibraryEntry = {
  userGameId: string;
  gameId: string;
  name: string;
  coverUrl: string | null;
  releaseYear: number | null;
  platform: string | null;
  status: UserGameStatus;
  genres: string[];
  typicalSessionMinutes: number;
  interruptible: boolean;
  hoursPlayed: number;
  sessionReportsCount: number;
  interruptibleReportsCount: number;
  hltbMainStoryMinutes: number | null;
  hltbMainExtraMinutes: number | null;
  hltbCompletionistMinutes: number | null;
};

export const LIBRARY_COLUMNS = {
  userGameId: userGames.id,
  gameId: games.id,
  name: games.name,
  coverUrl: games.coverUrl,
  releaseYear: games.releaseYear,
  platform: userGames.platform,
  status: userGames.status,
  genres: games.genres,
  typicalSessionMinutes: games.typicalSessionMinutes,
  interruptible: games.interruptible,
  hoursPlayed: userGames.hoursPlayed,
  sessionReportsCount: games.sessionReportsCount,
  interruptibleReportsCount: games.interruptibleReportsCount,
  hltbMainStoryMinutes: games.hltbMainStoryMinutes,
  hltbMainExtraMinutes: games.hltbMainExtraMinutes,
  hltbCompletionistMinutes: games.hltbCompletionistMinutes,
};

export async function getLibraryEntry(userGameId: string): Promise<LibraryEntry | null> {
  const rows = await db
    .select(LIBRARY_COLUMNS)
    .from(userGames)
    .innerJoin(games, eq(userGames.gameId, games.id))
    .where(eq(userGames.id, userGameId));

  return rows[0] ?? null;
}

type ManualGameInput = {
  name: string;
  platform: string | null;
  releaseYear: number | null;
};

/** נזרק כש-§5 (מגבלת 50 משחקים בחינם) נחצית — הקורא מנתב ל-/paywall. */
export class LibraryLimitReachedError extends Error {
  constructor() {
    super('Free library limit reached');
    this.name = 'LibraryLimitReachedError';
  }
}

async function assertCanAddGame(): Promise<void> {
  const isPro = await getIsPro();
  const currentCount = await countLibrary();
  if (!canAddGame(currentCount, isPro)) throw new LibraryLimitReachedError();
}

/** הוספה ידנית (§8 שלב 1) — לא תלויה באף API חיצוני. */
export async function addManualGame(input: ManualGameInput): Promise<string> {
  await assertCanAddGame();
  const gameId = localGameId();
  await db.insert(games).values({
    id: gameId,
    name: input.name.trim(),
    releaseYear: input.releaseYear,
    createdAt: new Date(),
  });
  void enrichGameWithHltb(gameId, input.name.trim());
  return linkGameToUser(gameId, input.platform);
}

export async function addGameFromIgdb(game: IgdbGame, platform: string | null): Promise<string> {
  await assertCanAddGame();
  const gameId = igdbGameId(game.igdbId);
  // פרופיל הסשן נקבע פעם אחת בייבוא: תיוג ידני אמיתי (seed, §4.5) אם קיים
  // למשחק הזה, אחרת ברירת המחדל של הארכיטיפ (§4.4). בשני המקרים §4.5
  // ממשיך לאסוף דיווחי סשן אמיתיים ומחליף אותו בהדרגה.
  const seedOverride = getSeedOverride(game.igdbId);
  const profile =
    seedOverride ??
    resolveSessionProfile({
      genres: game.genres,
      themes: game.themes,
      keywords: game.keywords,
    });

  await db
    .insert(games)
    .values({
      id: gameId,
      igdbId: game.igdbId,
      name: game.name,
      coverUrl: game.coverUrl,
      releaseYear: game.releaseYear,
      genres: game.genres,
      platforms: game.platforms,
      communityRating: game.communityRating,
      typicalSessionMinutes: profile.typicalMinutes,
      interruptible: profile.interruptible,
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  void enrichGameWithHltb(gameId, game.name);
  return linkGameToUser(gameId, platform ?? game.platforms[0] ?? null);
}

async function linkGameToUser(gameId: string, platform: string | null): Promise<string> {
  const userGameId = newId();
  await db.insert(userGames).values({
    id: userGameId,
    userId: LOCAL_USER_ID,
    gameId,
    platform,
    addedAt: new Date(),
  });
  return userGameId;
}

export async function countLibrary(): Promise<number> {
  const rows = await db
    .select({ id: userGames.id })
    .from(userGames)
    .where(eq(userGames.userId, LOCAL_USER_ID));
  return rows.length;
}

/** הפלטפורמות השונות שכבר קיימות בספרייה — משמש למגבלת "פלטפורמה אחת" בחינם (§5). */
export async function getConnectedPlatforms(): Promise<string[]> {
  const rows = await db
    .select({ platform: userGames.platform })
    .from(userGames)
    .where(eq(userGames.userId, LOCAL_USER_ID));
  return Array.from(new Set(rows.map((row) => row.platform).filter((v): v is string => !!v)));
}
