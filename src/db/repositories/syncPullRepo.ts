import { eq, inArray } from 'drizzle-orm';

import {
  fromRemoteCalibrationAnswer,
  fromRemoteGame,
  fromRemoteProfile,
  fromRemoteSession,
  fromRemoteUserGame,
} from '@/lib/sync/mapping';
import { findMissingRemoteIds, shouldApplyRemote } from '@/lib/sync/resolveConflict';
import { getSupabaseClient } from '@/lib/supabase';

import { LOCAL_USER_ID } from '../bootstrap';
import { db } from '../client';
import { calibrationAnswers, games, sessions, userGames, users } from '../schema';

/**
 * §8 שלב 4 — מושך שינויים מ-Supabase לתוך ה-SQLite המקומי. RLS כבר
 * מגביל כל שאילתה לשורות של המשתמש המחובר (auth.uid()) חוץ מ-`games`
 * שהוא קטלוג משותף לקריאה — שם מסננים בקוד לפי game_id רלוונטי בלבד,
 * לא שואבים את כל הקטלוג המרוחק.
 */
export async function pullRemoteChanges(authUserId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  await pullProfile(client, authUserId);
  const relevantGameIds = new Set<string>();
  await pullUserGames(client, relevantGameIds);
  await pullGames(client, relevantGameIds);
  await pullSessions(client);
  await pullCalibrationAnswers(client);
}

type SupabaseClientLike = ReturnType<typeof getSupabaseClient>;

async function pullProfile(client: NonNullable<SupabaseClientLike>, authUserId: string): Promise<void> {
  const { data, error } = await client.from('profiles').select('*').eq('id', authUserId).maybeSingle();
  if (error) throw error;
  if (!data) return;

  const [local] = await db.select().from(users).where(eq(users.id, LOCAL_USER_ID));
  if (shouldApplyRemote(local?.updatedAt ?? null, new Date(data.updated_at))) {
    await db
      .update(users)
      .set({ ...fromRemoteProfile(data), updatedAt: new Date(data.updated_at) })
      .where(eq(users.id, LOCAL_USER_ID));
  }
}

async function pullUserGames(client: NonNullable<SupabaseClientLike>, relevantGameIds: Set<string>) {
  const { data, error } = await client.from('user_games').select('*');
  if (error) throw error;
  if (!data || data.length === 0) return;

  for (const remoteRow of data) {
    relevantGameIds.add(remoteRow.game_id);
    const [local] = await db.select().from(userGames).where(eq(userGames.id, remoteRow.id));
    if (!shouldApplyRemote(local?.updatedAt ?? null, new Date(remoteRow.updated_at))) continue;

    const patch = fromRemoteUserGame(remoteRow);
    if (local) {
      await db.update(userGames).set(patch).where(eq(userGames.id, remoteRow.id));
    } else {
      await db.insert(userGames).values({ ...patch, userId: LOCAL_USER_ID });
    }
  }
}

async function pullGames(client: NonNullable<SupabaseClientLike>, relevantGameIds: Set<string>) {
  if (relevantGameIds.size === 0) return;
  const existing = await db
    .select({ id: games.id })
    .from(games)
    .where(inArray(games.id, [...relevantGameIds]));
  const missing = findMissingRemoteIds(
    existing.map((row) => row.id),
    [...relevantGameIds]
  );
  if (missing.length === 0) return;

  const { data, error } = await client.from('games').select('*').in('id', missing);
  if (error) throw error;
  if (!data || data.length === 0) return;

  for (const remoteRow of data) {
    await db.insert(games).values(fromRemoteGame(remoteRow)).onConflictDoNothing();
  }
}

async function pullSessions(client: NonNullable<SupabaseClientLike>) {
  const { data, error } = await client.from('sessions').select('*');
  if (error) throw error;
  if (!data || data.length === 0) return;

  const localIds = await db.select({ id: sessions.id }).from(sessions);
  const missing = findMissingRemoteIds(
    localIds.map((row) => row.id),
    data.map((row) => row.id)
  );
  if (missing.length === 0) return;

  const knownGameIds = new Set((await db.select({ id: games.id }).from(games)).map((row) => row.id));
  for (const remoteRow of data) {
    if (!missing.includes(remoteRow.id) || !knownGameIds.has(remoteRow.game_id)) continue;
    await db.insert(sessions).values({ ...fromRemoteSession(remoteRow), userId: LOCAL_USER_ID });
  }
}

async function pullCalibrationAnswers(client: NonNullable<SupabaseClientLike>) {
  const { data, error } = await client.from('calibration_answers').select('*');
  if (error) throw error;
  if (!data || data.length === 0) return;

  const localIds = await db.select({ id: calibrationAnswers.id }).from(calibrationAnswers);
  const missing = findMissingRemoteIds(
    localIds.map((row) => row.id),
    data.map((row) => row.id)
  );
  if (missing.length === 0) return;

  const knownSessionIds = new Set((await db.select({ id: sessions.id }).from(sessions)).map((row) => row.id));
  for (const remoteRow of data) {
    if (!missing.includes(remoteRow.id)) continue;
    const mapped = fromRemoteCalibrationAnswer(remoteRow);
    await db.insert(calibrationAnswers).values({
      ...mapped,
      userId: LOCAL_USER_ID,
      sessionId: mapped.sessionId && knownSessionIds.has(mapped.sessionId) ? mapped.sessionId : null,
    });
  }
}
