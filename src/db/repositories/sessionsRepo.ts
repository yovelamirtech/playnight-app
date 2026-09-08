import { and, desc, eq, gte, isNotNull, ne } from 'drizzle-orm';

import { isCalibrated, nextInterruptible, nextTypicalMinutes } from '@/lib/sessionLog/gameStats';
import { newId } from '@/lib/id';

import { LOCAL_USER_ID } from '../bootstrap';
import { db } from '../client';
import { calibrationAnswers, games, sessions, userGames, users } from '../schema';
import type { SessionRating, SessionRow, UserGameStatus } from '../schema';

export type CalibrationAnswerValue = 'yes' | 'no' | 'depends';

export type LogSessionInput = {
  userGameId: string;
  startedAt: Date | null;
  rating: SessionRating;
  calibrationAnswer: CalibrationAnswerValue | null;
  stoppedNote: string;
  finished: boolean;
  now?: Date;
};

const COULD_STOP_ANYTIME: Record<CalibrationAnswerValue, boolean | null> = {
  yes: true,
  no: false,
  depends: null,
};

/**
 * §3.4/§3.5 — סוגר סשן: כותב sessions, מעדכן games (§4.4, ממוצע נע +
 * רוב הכן/לא) ו-user_games (§6). כל הכתיבות בטרנזקציה אחת.
 */
export async function logSession(input: LogSessionInput): Promise<void> {
  const now = input.now ?? new Date();

  const rows = await db
    .select({
      gameId: userGames.gameId,
      status: userGames.status,
      typicalSessionMinutes: games.typicalSessionMinutes,
      interruptible: games.interruptible,
      sessionReportsCount: games.sessionReportsCount,
      interruptibleReportsCount: games.interruptibleReportsCount,
    })
    .from(userGames)
    .innerJoin(games, eq(userGames.gameId, games.id))
    .where(eq(userGames.id, input.userGameId));

  const current = rows[0];
  if (!current) throw new Error(`logSession: unknown userGameId ${input.userGameId}`);

  const durationMinutes = input.startedAt
    ? Math.max(1, Math.round((now.getTime() - input.startedAt.getTime()) / 60_000))
    : null;

  const sessionId = newId();
  await db.insert(sessions).values({
    id: sessionId,
    userId: LOCAL_USER_ID,
    gameId: current.gameId,
    startedAt: input.startedAt ?? now,
    endedAt: now,
    durationMinutes,
    rating: input.rating,
    stoppedNote: input.stoppedNote.trim() || null,
    couldStopAnytime: input.calibrationAnswer ? COULD_STOP_ANYTIME[input.calibrationAnswer] : null,
  });

  if (input.calibrationAnswer) {
    await db.insert(calibrationAnswers).values({
      id: newId(),
      userId: LOCAL_USER_ID,
      gameId: current.gameId,
      sessionId,
      questionId: 1,
      answerValue: input.calibrationAnswer,
      answeredAt: now,
    });
  }

  const newSessionReportsCount =
    durationMinutes !== null ? current.sessionReportsCount + 1 : current.sessionReportsCount;
  const newTypicalSessionMinutes =
    durationMinutes !== null
      ? nextTypicalMinutes(current.typicalSessionMinutes, current.sessionReportsCount, durationMinutes)
      : current.typicalSessionMinutes;

  let newInterruptibleReportsCount = current.interruptibleReportsCount;
  let newInterruptible = current.interruptible;
  if (input.calibrationAnswer) {
    newInterruptibleReportsCount += 1;
    const yesRows = await db
      .select({ id: calibrationAnswers.id })
      .from(calibrationAnswers)
      .where(
        and(
          eq(calibrationAnswers.gameId, current.gameId),
          eq(calibrationAnswers.questionId, 1),
          eq(calibrationAnswers.answerValue, 'yes')
        )
      );
    newInterruptible = nextInterruptible(
      yesRows.length,
      newInterruptibleReportsCount,
      current.interruptible
    );
  }

  await db
    .update(games)
    .set({
      typicalSessionMinutes: newTypicalSessionMinutes,
      interruptible: newInterruptible,
      sessionReportsCount: newSessionReportsCount,
      interruptibleReportsCount: newInterruptibleReportsCount,
      isCalibrated: isCalibrated(newSessionReportsCount),
    })
    .where(eq(games.id, current.gameId));

  const newStatus: UserGameStatus = input.finished
    ? 'beaten'
    : current.status === 'backlog'
      ? 'playing'
      : current.status;

  if (durationMinutes !== null) {
    const hoursRows = await db
      .select({ hoursPlayed: userGames.hoursPlayed })
      .from(userGames)
      .where(eq(userGames.id, input.userGameId));
    const priorHours = hoursRows[0]?.hoursPlayed ?? 0;
    await db
      .update(userGames)
      .set({ lastPlayedAt: now, hoursPlayed: priorHours + durationMinutes / 60, status: newStatus })
      .where(eq(userGames.id, input.userGameId));
  } else {
    await db
      .update(userGames)
      .set({ lastPlayedAt: now, status: newStatus })
      .where(eq(userGames.id, input.userGameId));
  }
}

export async function getSessionHistory(gameId: string, limit = 20): Promise<SessionRow[]> {
  return db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, LOCAL_USER_ID), eq(sessions.gameId, gameId)))
    .orderBy(desc(sessions.endedAt))
    .limit(limit);
}

/** §3.7 — "איפה עצרתי", כל ההערות לפי תאריך. */
export async function getStoppedNotes(gameId: string): Promise<SessionRow[]> {
  return db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, LOCAL_USER_ID),
        eq(sessions.gameId, gameId),
        isNotNull(sessions.stoppedNote),
        ne(sessions.stoppedNote, '')
      )
    )
    .orderBy(desc(sessions.endedAt));
}

function startOfToday(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** חסם עייפות יומי (§4.5) — כמה שאלות כיול המשתמש כבר ענה היום. */
export async function countCalibrationAnswersToday(now: Date = new Date()): Promise<number> {
  const rows = await db
    .select({ id: calibrationAnswers.id })
    .from(calibrationAnswers)
    .where(
      and(
        eq(calibrationAnswers.userId, LOCAL_USER_ID),
        gte(calibrationAnswers.answeredAt, startOfToday(now))
      )
    );
  return rows.length;
}

export async function getOptedOutOfCalibration(): Promise<boolean> {
  const rows = await db
    .select({ optedOutOfCalibration: users.optedOutOfCalibration })
    .from(users)
    .where(eq(users.id, LOCAL_USER_ID));
  return rows[0]?.optedOutOfCalibration ?? false;
}

/** §4.5.4 — "תפסיק לשאול אותי שאלות כיול", מכובד לצמיתות. */
export async function setOptedOutOfCalibration(value: boolean): Promise<void> {
  await db.update(users).set({ optedOutOfCalibration: value }).where(eq(users.id, LOCAL_USER_ID));
}
