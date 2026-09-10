import { and, eq } from 'drizzle-orm';

import type { RecommendationCandidate } from '@/lib/recommendation';

import { LOCAL_USER_ID } from '../bootstrap';
import { db } from '../client';
import { games, userGames } from '../schema';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * מועמד למסך ה-Swipe: RecommendationCandidate (מה שהמנוע הטהור צריך)
 * ועוד שדות תצוגה בלבד (§3.3 — cover, פלטפורמה) שהמנוע לא צריך לדעת עליהם.
 */
export type SwipeCandidate = RecommendationCandidate & {
  coverUrl: string | null;
  platform: string | null;
};

export async function getSwipeCandidates(): Promise<SwipeCandidate[]> {
  const rows = await db
    .select({
      userGameId: userGames.id,
      gameId: games.id,
      name: games.name,
      genres: games.genres,
      typicalMinutes: games.typicalSessionMinutes,
      interruptible: games.interruptible,
      communityRating: games.communityRating,
      status: userGames.status,
      hoursPlayed: userGames.hoursPlayed,
      addedAt: userGames.addedAt,
      lastPlayedAt: userGames.lastPlayedAt,
      progressPercent: userGames.progressPercent,
      isHidden: userGames.isHidden,
      dismissedUntil: userGames.dismissedUntil,
      coverUrl: games.coverUrl,
      platform: userGames.platform,
    })
    .from(userGames)
    .innerJoin(games, eq(userGames.gameId, games.id))
    .where(and(eq(userGames.userId, LOCAL_USER_ID), eq(userGames.isHidden, false)));

  return rows.map(({ typicalMinutes, interruptible, ...row }) => ({
    ...row,
    sessionProfile: { typicalMinutes, interruptible },
  }));
}

/** Swipe שמאלה (§3.3) — "לא הערב", מוריד עדיפות לשבוע במקום להסתיר. */
export async function dismissForWeek(userGameId: string, now: Date = new Date()): Promise<void> {
  await db
    .update(userGames)
    .set({ dismissedUntil: new Date(now.getTime() + WEEK_MS), updatedAt: now })
    .where(eq(userGames.id, userGameId));
}

/** Swipe למעלה (§3.3) — "לא בא לי מהמשחק הזה", מסתיר לתמיד. */
export async function hideForever(userGameId: string, now: Date = new Date()): Promise<void> {
  await db.update(userGames).set({ isHidden: true, updatedAt: now }).where(eq(userGames.id, userGameId));
}
