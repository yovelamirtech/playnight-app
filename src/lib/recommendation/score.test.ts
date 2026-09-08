import { describe, expect, it } from 'vitest';

import { scoreCandidate } from './score';
import type { RecommendationCandidate, RecommendationInput } from './types';

const NOW = new Date('2026-09-08T12:00:00Z');

function makeCandidate(overrides: Partial<RecommendationCandidate> = {}): RecommendationCandidate {
  return {
    userGameId: 'ug1',
    gameId: 'g1',
    name: 'Hades',
    genres: ['Role-playing (RPG)'],
    sessionProfile: { typicalMinutes: 15, interruptible: true },
    communityRating: 80,
    status: 'backlog',
    hoursPlayed: 3,
    addedAt: new Date('2026-08-01T00:00:00Z'),
    lastPlayedAt: new Date('2026-08-15T00:00:00Z'),
    progressPercent: null,
    isHidden: false,
    dismissedUntil: null,
    ...overrides,
  };
}

describe('scoreCandidate (§4.1)', () => {
  it('משחק מוסתר תמיד מקבל 0', () => {
    const result = scoreCandidate(makeCandidate({ isHidden: true }), { availableMinutes: 60, mood: null }, NOW);
    expect(result.score).toBe(0);
  });

  it('sessionFit=0 מאפס את כל הניקוד (אין טעם להציע)', () => {
    const candidate = makeCandidate({ sessionProfile: { typicalMinutes: 60, interruptible: false } });
    const result = scoreCandidate(candidate, { availableMinutes: 20, mood: null }, NOW);
    expect(result.sessionFit).toBe(0);
    expect(result.score).toBe(0);
  });

  it('status playing נותן בונוס מומנטום', () => {
    const playing = scoreCandidate(makeCandidate({ status: 'playing' }), { availableMinutes: 60, mood: null }, NOW);
    const backlog = scoreCandidate(makeCandidate({ status: 'backlog' }), { availableMinutes: 60, mood: null }, NOW);
    expect(playing.score).toBeGreaterThan(backlog.score);
  });

  it('משחק שנקנה מזמן ולא נגעו בו מקבל dust bonus', () => {
    const dusty = scoreCandidate(
      makeCandidate({ hoursPlayed: 0, lastPlayedAt: null, addedAt: new Date('2026-01-01T00:00:00Z') }),
      { availableMinutes: 60, mood: null },
      NOW
    );
    const fresh = scoreCandidate(
      makeCandidate({ hoursPlayed: 0, lastPlayedAt: null, addedAt: NOW }),
      { availableMinutes: 60, mood: null },
      NOW
    );
    expect(dusty.score).toBeGreaterThan(fresh.score);
  });

  it('dismissedThisWeek מכפיל את הניקוד ב-0.3', () => {
    const input: RecommendationInput = { availableMinutes: 60, mood: null };
    const notDismissed = scoreCandidate(makeCandidate(), input, NOW);
    const dismissed = scoreCandidate(
      makeCandidate({ dismissedUntil: new Date('2026-09-10T00:00:00Z') }),
      input,
      NOW
    );
    expect(dismissed.score).toBeCloseTo(notDismissed.score * 0.3, 5);
  });

  it('dismissedUntil שכבר עבר לא מפעיל את המכפיל', () => {
    const input: RecommendationInput = { availableMinutes: 60, mood: null };
    const notDismissed = scoreCandidate(makeCandidate(), input, NOW);
    const expired = scoreCandidate(
      makeCandidate({ dismissedUntil: new Date('2026-09-01T00:00:00Z') }),
      input,
      NOW
    );
    expect(expired.score).toBeCloseTo(notDismissed.score, 5);
  });

  it('communityRating חסר מקבל ניקוד נייטרלי (0.5), לא עונש', () => {
    const input: RecommendationInput = { availableMinutes: 60, mood: null };
    const rated = scoreCandidate(makeCandidate({ communityRating: 50 }), input, NOW);
    const unrated = scoreCandidate(makeCandidate({ communityRating: null }), input, NOW);
    expect(rated.score).toBeCloseTo(unrated.score, 5);
  });

  it('moodMatch תואם מעלה את הניקוד לעומת לא-תואם', () => {
    const matching = scoreCandidate(
      makeCandidate({ genres: ['Role-playing (RPG)'] }),
      { availableMinutes: 60, mood: 'deep' },
      NOW
    );
    const notMatching = scoreCandidate(
      makeCandidate({ genres: ['Shooter'] }),
      { availableMinutes: 60, mood: 'deep' },
      NOW
    );
    expect(matching.score).toBeGreaterThan(notMatching.score);
  });
});
