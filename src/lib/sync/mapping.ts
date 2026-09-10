import type {
  CalibrationAnswerRow,
  GameRow,
  NewCalibrationAnswerRow,
  NewGameRow,
  NewSessionRow,
  SessionRow,
  UserGameRow,
  UserRow,
} from '@/db/schema';

import type {
  RemoteCalibrationAnswerRow,
  RemoteGameRow,
  RemoteProfileRow,
  RemoteSessionRow,
  RemoteUserGameRow,
} from './types';

/** local `users` → `profiles` מרוחק (§8 שלב 4). id הוא auth.uid(), לא LOCAL_USER_ID. */
export function toRemoteProfile(user: UserRow, authUserId: string): RemoteProfileRow {
  return {
    id: authUserId,
    email: user.email,
    is_pro: user.isPro,
    default_session_minutes: user.defaultSessionMinutes,
    primary_platforms: user.primaryPlatforms,
    opted_out_of_calibration: user.optedOutOfCalibration,
    updated_at: user.updatedAt.toISOString(),
  };
}

/** ההפך — לא כולל id/updatedAt: השורה המקומית תמיד LOCAL_USER_ID, updatedAt מתעדכן ע"י הקורא. */
export function fromRemoteProfile(row: RemoteProfileRow): Partial<UserRow> {
  return {
    email: row.email,
    isPro: row.is_pro,
    defaultSessionMinutes: row.default_session_minutes,
    primaryPlatforms: row.primary_platforms,
    optedOutOfCalibration: row.opted_out_of_calibration,
  };
}

export function toRemoteGame(game: GameRow): RemoteGameRow {
  return {
    id: game.id,
    igdb_id: game.igdbId,
    name: game.name,
    cover_url: game.coverUrl,
    release_year: game.releaseYear,
    genres: game.genres,
    platforms: game.platforms,
    community_rating: game.communityRating,
    typical_session_minutes: game.typicalSessionMinutes,
    interruptible: game.interruptible,
    session_reports_count: game.sessionReportsCount,
    interruptible_reports_count: game.interruptibleReportsCount,
    is_calibrated: game.isCalibrated,
    hltb_main_story_minutes: game.hltbMainStoryMinutes,
    hltb_main_extra_minutes: game.hltbMainExtraMinutes,
    hltb_completionist_minutes: game.hltbCompletionistMinutes,
    hltb_looked_up_at: game.hltbLookedUpAt?.toISOString() ?? null,
    created_at: game.createdAt.toISOString(),
  };
}

export function fromRemoteGame(row: RemoteGameRow): NewGameRow {
  return {
    id: row.id,
    igdbId: row.igdb_id,
    name: row.name,
    coverUrl: row.cover_url,
    releaseYear: row.release_year,
    genres: row.genres,
    platforms: row.platforms,
    communityRating: row.community_rating,
    typicalSessionMinutes: row.typical_session_minutes,
    interruptible: row.interruptible,
    sessionReportsCount: row.session_reports_count,
    interruptibleReportsCount: row.interruptible_reports_count,
    isCalibrated: row.is_calibrated,
    hltbMainStoryMinutes: row.hltb_main_story_minutes,
    hltbMainExtraMinutes: row.hltb_main_extra_minutes,
    hltbCompletionistMinutes: row.hltb_completionist_minutes,
    hltbLookedUpAt: row.hltb_looked_up_at ? new Date(row.hltb_looked_up_at) : null,
    createdAt: new Date(row.created_at),
  };
}

export function toRemoteUserGame(row: UserGameRow, authUserId: string): RemoteUserGameRow {
  return {
    id: row.id,
    user_id: authUserId,
    game_id: row.gameId,
    status: row.status,
    platform: row.platform,
    added_at: row.addedAt.toISOString(),
    last_played_at: row.lastPlayedAt?.toISOString() ?? null,
    hours_played: row.hoursPlayed,
    progress_percent: row.progressPercent,
    is_hidden: row.isHidden,
    dismissed_until: row.dismissedUntil?.toISOString() ?? null,
    updated_at: row.updatedAt.toISOString(),
  };
}

/** ההפך — userId תמיד LOCAL_USER_ID בצד הקורא, לא row.user_id (זה ה-auth uid המרוחק). */
export function fromRemoteUserGame(row: RemoteUserGameRow): Omit<UserGameRow, 'userId'> {
  return {
    id: row.id,
    gameId: row.game_id,
    status: row.status as UserGameRow['status'],
    platform: row.platform,
    addedAt: new Date(row.added_at),
    lastPlayedAt: row.last_played_at ? new Date(row.last_played_at) : null,
    hoursPlayed: row.hours_played,
    progressPercent: row.progress_percent,
    isHidden: row.is_hidden,
    dismissedUntil: row.dismissed_until ? new Date(row.dismissed_until) : null,
    updatedAt: new Date(row.updated_at),
  };
}

export function toRemoteSession(row: SessionRow, authUserId: string): RemoteSessionRow {
  return {
    id: row.id,
    user_id: authUserId,
    game_id: row.gameId,
    started_at: row.startedAt.toISOString(),
    ended_at: row.endedAt?.toISOString() ?? null,
    duration_minutes: row.durationMinutes,
    mood_before: row.moodBefore,
    rating: row.rating,
    stopped_note: row.stoppedNote,
    could_stop_anytime: row.couldStopAnytime,
    screenshot_url: row.screenshotUrl,
  };
}

export function fromRemoteSession(row: RemoteSessionRow): Omit<NewSessionRow, 'userId'> {
  return {
    id: row.id,
    gameId: row.game_id,
    startedAt: new Date(row.started_at),
    endedAt: row.ended_at ? new Date(row.ended_at) : null,
    durationMinutes: row.duration_minutes,
    moodBefore: row.mood_before,
    rating: row.rating as SessionRow['rating'],
    stoppedNote: row.stopped_note,
    couldStopAnytime: row.could_stop_anytime,
    screenshotUrl: row.screenshot_url,
  };
}

export function toRemoteCalibrationAnswer(
  row: CalibrationAnswerRow,
  authUserId: string
): RemoteCalibrationAnswerRow {
  return {
    id: row.id,
    user_id: authUserId,
    game_id: row.gameId,
    session_id: row.sessionId,
    question_id: row.questionId,
    answer_value: row.answerValue,
    answered_at: row.answeredAt.toISOString(),
  };
}

export function fromRemoteCalibrationAnswer(
  row: RemoteCalibrationAnswerRow
): Omit<NewCalibrationAnswerRow, 'userId'> {
  return {
    id: row.id,
    gameId: row.game_id,
    sessionId: row.session_id,
    questionId: row.question_id,
    answerValue: row.answer_value,
    answeredAt: new Date(row.answered_at),
  };
}
