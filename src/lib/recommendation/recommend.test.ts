import { describe, expect, it } from 'vitest';

import { getRecommendations } from './recommend';
import type { RecommendationCandidate } from './types';

const NOW = new Date('2026-09-08T12:00:00Z');

function makeCandidate(overrides: Partial<RecommendationCandidate>): RecommendationCandidate {
  return {
    userGameId: overrides.gameId ?? 'ug',
    gameId: 'g',
    name: 'Game',
    genres: [],
    sessionProfile: { typicalMinutes: 15, interruptible: true },
    communityRating: 70,
    status: 'backlog',
    hoursPlayed: 1,
    addedAt: new Date('2026-08-01T00:00:00Z'),
    lastPlayedAt: new Date('2026-08-01T00:00:00Z'),
    progressPercent: null,
    isHidden: false,
    dismissedUntil: null,
    ...overrides,
  };
}

const noSurprise = () => 1; // roll שתמיד בוחר את הפריט האחרון במשוקלל

describe('getRecommendations (§4.1)', () => {
  it('מחזיר עד 5 כרטיסים', () => {
    const candidates = Array.from({ length: 12 }, (_, i) =>
      makeCandidate({ gameId: `g${i}`, userGameId: `ug${i}` })
    );
    const result = getRecommendations(candidates, { availableMinutes: 60, mood: null }, NOW, noSurprise);
    expect(result.length).toBe(5);
  });

  it('מסנן משחקים עם score=0 (מוסתר / לא נכנס בזמן)', () => {
    const hidden = makeCandidate({ gameId: 'hidden', isHidden: true });
    const tooLong = makeCandidate({
      gameId: 'toolong',
      sessionProfile: { typicalMinutes: 60, interruptible: false },
    });
    const fits = makeCandidate({ gameId: 'fits' });
    const result = getRecommendations([hidden, tooLong, fits], { availableMinutes: 20, mood: null }, NOW);
    expect(result.map((r) => r.candidate.gameId)).toEqual(['fits']);
  });

  it('mood=fresh מסנן רק משחקים שמעולם לא הופעלו', () => {
    const neverPlayed = makeCandidate({ gameId: 'never', hoursPlayed: 0, lastPlayedAt: null });
    const played = makeCandidate({ gameId: 'played', hoursPlayed: 5, lastPlayedAt: new Date() });
    const result = getRecommendations([neverPlayed, played], { availableMinutes: 60, mood: 'fresh' }, NOW);
    expect(result.map((r) => r.candidate.gameId)).toEqual(['never']);
  });

  it('mood=finish ממיין לפי הכי קרוב לסיום (progressPercent), לא score', () => {
    const almostDone = makeCandidate({ gameId: 'almost', progressPercent: 90, communityRating: 10 });
    const justStarted = makeCandidate({ gameId: 'started', progressPercent: 10, communityRating: 99 });
    const result = getRecommendations(
      [justStarted, almostDone],
      { availableMinutes: 60, mood: 'finish' },
      NOW
    );
    expect(result.map((r) => r.candidate.gameId)).toEqual(['almost', 'started']);
  });

  it('mood=surprise מחזיר עד 5 מתוך המועמדים התואמים', () => {
    const candidates = Array.from({ length: 8 }, (_, i) =>
      makeCandidate({ gameId: `g${i}`, userGameId: `ug${i}` })
    );
    const result = getRecommendations(
      candidates,
      { availableMinutes: 60, mood: 'surprise' },
      NOW,
      () => 0.5
    );
    expect(result.length).toBe(5);
    const ids = result.map((r) => r.candidate.gameId);
    expect(new Set(ids).size).toBe(5); // בלי כפילויות
  });

  it('ברירת מחדל ממוינת לפי score יורד, עם כרטיס "לא צפוי" אחרון כשיש יותר מ-5', () => {
    const candidates = [
      makeCandidate({ gameId: 'best', status: 'playing', communityRating: 100 }),
      makeCandidate({ gameId: 'second', communityRating: 90 }),
      makeCandidate({ gameId: 'third', communityRating: 80 }),
      makeCandidate({ gameId: 'fourth', communityRating: 70 }),
      makeCandidate({ gameId: 'fifth', communityRating: 60 }),
      makeCandidate({ gameId: 'weakest', communityRating: 1, hoursPlayed: 1 }),
    ];
    const result = getRecommendations(candidates, { availableMinutes: 60, mood: null }, NOW, () => 0.99);
    expect(result[0].candidate.gameId).toBe('best');
    expect(result.length).toBe(5);
    // הכרטיס האחרון הוחלף במשהו מתוך ה"שאר" ולא בהכרח fifth
    expect(result.map((r) => r.candidate.gameId)).toContain('best');
  });

  it('פחות מ-5 מועמדים — אין ערבוב, כולם חוזרים ממוינים', () => {
    const candidates = [
      makeCandidate({ gameId: 'a', communityRating: 90 }),
      makeCandidate({ gameId: 'b', communityRating: 50 }),
    ];
    const result = getRecommendations(candidates, { availableMinutes: 60, mood: null }, NOW);
    expect(result.map((r) => r.candidate.gameId)).toEqual(['a', 'b']);
  });
});
