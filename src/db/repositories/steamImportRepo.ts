import { eq } from 'drizzle-orm';

import { newId, steamGameId } from '@/lib/id';
import type { SteamOwnedGame } from '@/lib/steam';

import { LOCAL_USER_ID } from '../bootstrap';
import { db } from '../client';
import { games, userGames } from '../schema';

export type SteamImportResult = { imported: number; updated: number; total: number };

/**
 * ייבוא Steam (§4.3, §8 שלב 2). לכל משחק: שורת קטלוג משלו (id יציב
 * לפי appid, כמו igdbGameId), ולינק ל-user_games עם שעות המשחק בפועל.
 * ריצה חוזרת על אותה ספרייה מעדכנת שעות במקום ליצור כפילויות.
 *
 * בלי העשרת ז'אנר/ארכיטיפ מ-IGDB בשלב הזה בכוונה (§4.3: "אל תיתקע פה") —
 * המשחקים מתחילים בברירת המחדל השמרנית של הסכמה (§4.4 החלטה #5),
 * ו-§4.5 ממשיך לאסוף דיווחי סשן אמיתיים כמו כל משחק אחר.
 */
export async function importSteamGames(
  ownedGames: SteamOwnedGame[],
  onProgress?: (done: number, total: number) => void,
): Promise<SteamImportResult> {
  const existingLinks = await db
    .select({ gameId: userGames.gameId, userGameId: userGames.id })
    .from(userGames)
    .where(eq(userGames.userId, LOCAL_USER_ID));
  const existingByGameId = new Map(existingLinks.map((row) => [row.gameId, row.userGameId]));

  let imported = 0;
  let updated = 0;

  for (const [index, game] of ownedGames.entries()) {
    const gameId = steamGameId(game.appId);
    await db
      .insert(games)
      .values({
        id: gameId,
        name: game.name,
        coverUrl: game.coverUrl,
        platforms: ['PC'],
        createdAt: new Date(),
      })
      .onConflictDoNothing();

    const hoursPlayed = game.playtimeMinutes / 60;
    const existingUserGameId = existingByGameId.get(gameId);
    if (existingUserGameId) {
      await db.update(userGames).set({ hoursPlayed }).where(eq(userGames.id, existingUserGameId));
      updated += 1;
    } else {
      await db.insert(userGames).values({
        id: newId(),
        userId: LOCAL_USER_ID,
        gameId,
        platform: 'Steam',
        addedAt: new Date(),
        hoursPlayed,
      });
      imported += 1;
    }

    onProgress?.(index + 1, ownedGames.length);
  }

  return { imported, updated, total: ownedGames.length };
}
