import { describe, expect, it } from 'vitest';

import type { CalibrationAnswerRow, GameRow, SessionRow, UserGameRow, UserRow } from '@/db/schema';

import {
  fromRemoteCalibrationAnswer,
  fromRemoteGame,
  fromRemoteProfile,
  fromRemoteSession,
  fromRemoteUserGame,
  toRemoteCalibrationAnswer,
  toRemoteGame,
  toRemoteProfile,
  toRemoteSession,
  toRemoteUserGame,
} from './mapping';

const AUTH_USER_ID = 'auth-uid-123';

describe('profile mapping', () => {
  const user: UserRow = {
    id: 'local-user',
    email: 'player@example.com',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    isPro: false,
    defaultSessionMinutes: 60,
    primaryPlatforms: ['Steam', 'PC'],
    optedOutOfCalibration: false,
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  };

  it('round-trips the fields that matter, using the remote auth id', () => {
    const remote = toRemoteProfile(user, AUTH_USER_ID);
    expect(remote.id).toBe(AUTH_USER_ID);
    expect(remote.email).toBe(user.email);

    const patch = fromRemoteProfile(remote);
    expect(patch).toEqual({
      email: user.email,
      isPro: user.isPro,
      defaultSessionMinutes: user.defaultSessionMinutes,
      primaryPlatforms: user.primaryPlatforms,
      optedOutOfCalibration: user.optedOutOfCalibration,
    });
  });
});

describe('game mapping', () => {
  const game: GameRow = {
    id: 'igdb:1020',
    igdbId: 1020,
    name: 'Hades',
    coverUrl: 'https://example.com/hades.jpg',
    releaseYear: 2020,
    genres: ['Role-playing (RPG)'],
    platforms: ['PC'],
    communityRating: 93,
    typicalSessionMinutes: 30,
    interruptible: true,
    sessionReportsCount: 16,
    interruptibleReportsCount: 12,
    isCalibrated: true,
    hltbMainStoryMinutes: 1320,
    hltbMainExtraMinutes: 1980,
    hltbCompletionistMinutes: 3300,
    hltbLookedUpAt: new Date('2026-01-01T00:00:00Z'),
    createdAt: new Date('2025-12-01T00:00:00Z'),
  };

  it('round-trips through the remote shape', () => {
    const remote = toRemoteGame(game);
    const back = fromRemoteGame(remote);
    expect(back).toEqual(game);
  });

  it('keeps null HLTB fields null instead of coercing to a date', () => {
    const withoutHltb: GameRow = { ...game, hltbLookedUpAt: null };
    const remote = toRemoteGame(withoutHltb);
    expect(remote.hltb_looked_up_at).toBeNull();
    expect(fromRemoteGame(remote).hltbLookedUpAt).toBeNull();
  });
});

describe('user_games mapping', () => {
  const userGame: UserGameRow = {
    id: 'ug-1',
    userId: 'local-user',
    gameId: 'igdb:1020',
    status: 'playing',
    platform: 'PC',
    addedAt: new Date('2026-01-01T00:00:00Z'),
    lastPlayedAt: new Date('2026-01-05T00:00:00Z'),
    hoursPlayed: 12.5,
    progressPercent: 40,
    isHidden: false,
    dismissedUntil: null,
    updatedAt: new Date('2026-01-05T00:00:00Z'),
  };

  it('round-trips, dropping the local sentinel user id', () => {
    const remote = toRemoteUserGame(userGame, AUTH_USER_ID);
    expect(remote.user_id).toBe(AUTH_USER_ID);

    const { userId: _userId, ...withoutUserId } = userGame;
    expect(fromRemoteUserGame(remote)).toEqual(withoutUserId);
  });
});

describe('session mapping', () => {
  const session: SessionRow = {
    id: 'sess-1',
    userId: 'local-user',
    gameId: 'igdb:1020',
    startedAt: new Date('2026-01-05T20:00:00Z'),
    endedAt: new Date('2026-01-05T20:30:00Z'),
    durationMinutes: 30,
    moodBefore: 'chill',
    rating: 'liked',
    stoppedNote: 'reached the surface',
    couldStopAnytime: true,
    screenshotUrl: null,
  };

  it('round-trips, dropping the local sentinel user id', () => {
    const remote = toRemoteSession(session, AUTH_USER_ID);
    expect(remote.user_id).toBe(AUTH_USER_ID);

    const { userId: _userId, ...withoutUserId } = session;
    expect(fromRemoteSession(remote)).toEqual(withoutUserId);
  });
});

describe('calibration answer mapping', () => {
  const answer: CalibrationAnswerRow = {
    id: 'calib-1',
    userId: 'local-user',
    gameId: 'igdb:1020',
    sessionId: 'sess-1',
    questionId: 1,
    answerValue: 'yes',
    answeredAt: new Date('2026-01-05T20:30:00Z'),
  };

  it('round-trips, dropping the local sentinel user id', () => {
    const remote = toRemoteCalibrationAnswer(answer, AUTH_USER_ID);
    expect(remote.user_id).toBe(AUTH_USER_ID);

    const { userId: _userId, ...withoutUserId } = answer;
    expect(fromRemoteCalibrationAnswer(remote)).toEqual(withoutUserId);
  });
});
