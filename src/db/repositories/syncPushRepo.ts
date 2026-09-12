import { eq, inArray } from 'drizzle-orm';

import {
  toRemoteCalibrationAnswer,
  toRemoteGame,
  toRemoteProfile,
  toRemoteSession,
  toRemoteUserGame,
} from '@/lib/sync/mapping';
import { getSupabaseClient } from '@/lib/supabase';
import { unwrap } from '@/lib/supabase/unwrap';

import { LOCAL_USER_ID } from '../bootstrap';
import { db } from '../client';
import { calibrationAnswers, games, sessions, userGames, users } from '../schema';

/**
 * §8 שלב 4 — דוחף את הנתונים המקומיים ל-Supabase. best-effort: כל שלב
 * upsert בנפרד, לא טרנזקציה אחת — כישלון בשלב אחד (למשל רשת נפלה
 * באמצע) לא אמור להפיל את כל הסנכרון, הפעם הבאה תשלים את החסר.
 */
export async function pushLocalChanges(authUserId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const [user] = await db.select().from(users).where(eq(users.id, LOCAL_USER_ID));
  if (user) {
    await unwrap(client.from('profiles').upsert(toRemoteProfile(user, authUserId)));
  }

  const ownedUserGames = await db.select().from(userGames).where(eq(userGames.userId, LOCAL_USER_ID));
  if (ownedUserGames.length > 0) {
    const gameIds = [...new Set(ownedUserGames.map((row) => row.gameId))];
    const ownedGames = await db.select().from(games).where(inArray(games.id, gameIds));
    if (ownedGames.length > 0) {
      await unwrap(
        client.from('games').upsert(
          ownedGames.map((game) => toRemoteGame(game)),
          { ignoreDuplicates: true }
        )
      );
    }

    await unwrap(client.from('user_games').upsert(ownedUserGames.map((row) => toRemoteUserGame(row, authUserId))));
  }

  const ownedSessions = await db.select().from(sessions).where(eq(sessions.userId, LOCAL_USER_ID));
  if (ownedSessions.length > 0) {
    await unwrap(client.from('sessions').upsert(ownedSessions.map((row) => toRemoteSession(row, authUserId))));
  }

  const ownedAnswers = await db
    .select()
    .from(calibrationAnswers)
    .where(eq(calibrationAnswers.userId, LOCAL_USER_ID));
  if (ownedAnswers.length > 0) {
    await unwrap(
      client
        .from('calibration_answers')
        .upsert(ownedAnswers.map((row) => toRemoteCalibrationAnswer(row, authUserId)))
    );
  }
}
