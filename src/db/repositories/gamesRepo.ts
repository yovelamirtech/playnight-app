import { and, desc, eq } from 'drizzle-orm';

import type { IgdbGame } from '@/lib/igdb';
import { igdbGameId, localGameId, newId } from '@/lib/id';
import { resolveSessionProfile } from '@/lib/sessionProfile/archetype';

import { LOCAL_USER_ID } from '../bootstrap';
import { db } from '../client';
import { games, userGames } from '../schema';
import type { UserGameStatus } from '../schema';

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
};

const LIBRARY_COLUMNS = {
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
};

export async function listLibrary(status?: UserGameStatus): Promise<LibraryEntry[]> {
  const scope = status
    ? and(eq(userGames.userId, LOCAL_USER_ID), eq(userGames.status, status))
    : eq(userGames.userId, LOCAL_USER_ID);

  return db
    .select(LIBRARY_COLUMNS)
    .from(userGames)
    .innerJoin(games, eq(userGames.gameId, games.id))
    .where(scope)
    .orderBy(desc(userGames.addedAt));
}

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

/** הוספה ידנית (§8 שלב 1) — לא תלויה באף API חיצוני. */
export async function addManualGame(input: ManualGameInput): Promise<string> {
  const gameId = localGameId();
  await db.insert(games).values({
    id: gameId,
    name: input.name.trim(),
    releaseYear: input.releaseYear,
    createdAt: new Date(),
  });
  return linkGameToUser(gameId, input.platform);
}

export async function addGameFromIgdb(game: IgdbGame, platform: string | null): Promise<string> {
  const gameId = igdbGameId(game.igdbId);
  // פרופיל הסשן נקבע פעם אחת בייבוא מברירות המחדל של §4.4;
  // §4.5 מחליף אותו בהמשך בנתוני סשנים אמיתיים.
  const profile = resolveSessionProfile({
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
