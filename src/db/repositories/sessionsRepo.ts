import { and, desc, eq, gte, inArray, isNotNull, ne } from 'drizzle-orm';

import type { CalibrationQuestionId } from '@/lib/calibration/pickQuestion';
import {
  SESSION_LENGTH_BUCKET_MINUTES,
  saveFrequencyLeansInterruptible,
} from '@/lib/calibration/questionValues';
import type { SaveFrequency, SessionLengthBucket, SessionStyle } from '@/lib/calibration/questionValues';
import type { MoodId } from '@/constants/session';
import { isCalibrated, nextInterruptible, nextTypicalMinutes } from '@/lib/sessionLog/gameStats';
import { newId } from '@/lib/id';

import { LOCAL_USER_ID } from '../bootstrap';
import { db } from '../client';
import { calibrationAnswers, games, sessions, userGames, users } from '../schema';
import type { SessionRating, SessionRow, UserGameStatus } from '../schema';

export type Question1AnswerValue = 'yes' | 'no' | 'depends';

/** ערך תשובה יחיד לכל שאלות הכיול (§4.5, "בנק השאלות") — הערכים לא חופפים בין שאלה לשאלה. */
export type CalibrationAnswerRawValue =
  | Question1AnswerValue
  | SessionLengthBucket
  | SaveFrequency
  | SessionStyle
  | 'accurate'
  | MoodId;

export type CalibrationAnswerInput = {
  questionId: CalibrationQuestionId;
  value: CalibrationAnswerRawValue;
};

export type LogSessionInput = {
  userGameId: string;
  startedAt: Date | null;
  rating: SessionRating;
  calibrationAnswer: CalibrationAnswerInput | null;
  stoppedNote: string;
  finished: boolean;
  now?: Date;
};

const COULD_STOP_ANYTIME: Record<Question1AnswerValue, boolean | null> = {
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
  const calibration = input.calibrationAnswer;
  await db.insert(sessions).values({
    id: sessionId,
    userId: LOCAL_USER_ID,
    gameId: current.gameId,
    startedAt: input.startedAt ?? now,
    endedAt: now,
    durationMinutes,
    rating: input.rating,
    stoppedNote: input.stoppedNote.trim() || null,
    couldStopAnytime:
      calibration?.questionId === 1
        ? COULD_STOP_ANYTIME[calibration.value as Question1AnswerValue]
        : null,
  });

  if (calibration) {
    await db.insert(calibrationAnswers).values({
      id: newId(),
      userId: LOCAL_USER_ID,
      gameId: current.gameId,
      sessionId,
      questionId: calibration.questionId,
      answerValue: calibration.value,
      answeredAt: now,
    });
  }

  // שאלה #2 מזינה typical_session_minutes בדיוק כמו דיווח משך אמיתי (§4.5) —
  // שתי ההזנות מצטברות ברצף אם שתיהן קרו באותו סשן.
  let newSessionReportsCount = current.sessionReportsCount;
  let newTypicalSessionMinutes = current.typicalSessionMinutes;
  if (durationMinutes !== null) {
    newTypicalSessionMinutes = nextTypicalMinutes(
      newTypicalSessionMinutes,
      newSessionReportsCount,
      durationMinutes
    );
    newSessionReportsCount += 1;
  }
  if (calibration?.questionId === 2) {
    const bucketMinutes = SESSION_LENGTH_BUCKET_MINUTES[calibration.value as SessionLengthBucket];
    newTypicalSessionMinutes = nextTypicalMinutes(
      newTypicalSessionMinutes,
      newSessionReportsCount,
      bucketMinutes
    );
    newSessionReportsCount += 1;
  }

  // שאלות #1 ו-#3 מזינות יחד את interruptible (§4.5: "תוסף ל-interruptible").
  let newInterruptibleReportsCount = current.interruptibleReportsCount;
  let newInterruptible = current.interruptible;
  if (calibration?.questionId === 1 || calibration?.questionId === 3) {
    newInterruptibleReportsCount += 1;
    const signalRows = await db
      .select({
        questionId: calibrationAnswers.questionId,
        answerValue: calibrationAnswers.answerValue,
      })
      .from(calibrationAnswers)
      .where(
        and(eq(calibrationAnswers.gameId, current.gameId), inArray(calibrationAnswers.questionId, [1, 3]))
      );
    const leansInterruptibleCount = signalRows.filter((row) =>
      row.questionId === 1
        ? COULD_STOP_ANYTIME[row.answerValue as Question1AnswerValue] === true
        : saveFrequencyLeansInterruptible(row.answerValue as SaveFrequency)
    ).length;
    newInterruptible = nextInterruptible(
      leansInterruptibleCount,
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
      .set({
        lastPlayedAt: now,
        hoursPlayed: priorHours + durationMinutes / 60,
        status: newStatus,
        updatedAt: now,
      })
      .where(eq(userGames.id, input.userGameId));
  } else {
    await db
      .update(userGames)
      .set({ lastPlayedAt: now, status: newStatus, updatedAt: now })
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

/** כמה תשובות כבר יש לכל אחת משאלות 2–5 עבור המשחק — מזין את הרוטציה המשוקללת (§4.5). */
export async function getRotatingQuestionAnsweredCounts(
  gameId: string
): Promise<Partial<Record<2 | 3 | 4 | 5, number>>> {
  const rows = await db
    .select({ questionId: calibrationAnswers.questionId })
    .from(calibrationAnswers)
    .where(and(eq(calibrationAnswers.gameId, gameId), inArray(calibrationAnswers.questionId, [2, 3, 4, 5])));

  const counts: Partial<Record<2 | 3 | 4 | 5, number>> = {};
  for (const row of rows) {
    const id = row.questionId as 2 | 3 | 4 | 5;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
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
  await db
    .update(users)
    .set({ optedOutOfCalibration: value, updatedAt: new Date() })
    .where(eq(users.id, LOCAL_USER_ID));
}
