import { describe, expect, it } from 'vitest';

import {
  FREE_LIBRARY_LIMIT,
  FREE_STOPPED_NOTES_LIMIT,
  FREE_SWIPE_RECOMMENDATIONS_LIMIT,
  canAddGame,
  canAddStoppedNote,
  canConnectPlatform,
  maxSwipeRecommendations,
} from './limits';

describe('canAddGame', () => {
  it('allows adding while under the free limit', () => {
    expect(canAddGame(FREE_LIBRARY_LIMIT - 1, false)).toBe(true);
  });

  it('blocks adding at the free limit', () => {
    expect(canAddGame(FREE_LIBRARY_LIMIT, false)).toBe(false);
  });

  it('never blocks a Pro user', () => {
    expect(canAddGame(10_000, true)).toBe(true);
  });
});

describe('canConnectPlatform', () => {
  it('allows the first platform on free', () => {
    expect(canConnectPlatform([], 'Steam', false)).toBe(true);
  });

  it('allows re-syncing the already-connected platform', () => {
    expect(canConnectPlatform(['Steam'], 'Steam', false)).toBe(true);
  });

  it('blocks a second distinct platform on free', () => {
    expect(canConnectPlatform(['Steam'], 'Xbox', false)).toBe(false);
  });

  it('never blocks a Pro user', () => {
    expect(canConnectPlatform(['Steam', 'Xbox'], 'PlayStation', true)).toBe(true);
  });
});

describe('canAddStoppedNote', () => {
  it('allows notes under the free limit', () => {
    expect(canAddStoppedNote(FREE_STOPPED_NOTES_LIMIT - 1, false)).toBe(true);
  });

  it('blocks notes at the free limit', () => {
    expect(canAddStoppedNote(FREE_STOPPED_NOTES_LIMIT, false)).toBe(false);
  });

  it('never blocks a Pro user', () => {
    expect(canAddStoppedNote(500, true)).toBe(true);
  });
});

describe('maxSwipeRecommendations', () => {
  it('caps free users at the SPEC §5 limit', () => {
    expect(maxSwipeRecommendations(false)).toBe(FREE_SWIPE_RECOMMENDATIONS_LIMIT);
  });

  it('is unlimited for Pro users', () => {
    expect(maxSwipeRecommendations(true)).toBe(Infinity);
  });
});
