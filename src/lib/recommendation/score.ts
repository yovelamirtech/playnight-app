import { moodMatch } from './moodMatch';
import { sessionFit } from './sessionFit';
import type { RecommendationCandidate, RecommendationInput } from './types';

const DUST_MAX_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

function momentum(status: RecommendationCandidate['status']): number {
  return status === 'playing' ? 1 : 0;
}

/** "קנית ולא נגעת" — עולה ככל שעובר יותר זמן ממועד ההוספה בלי סשן אחד. */
function dustFactor(candidate: RecommendationCandidate, now: Date): number {
  if (candidate.hoursPlayed > 0) return 0;
  const daysSinceAdded = (now.getTime() - candidate.addedAt.getTime()) / DAY_MS;
  return Math.max(0, Math.min(1, daysSinceAdded / DUST_MAX_DAYS));
}

/** communityRating הוא סולם 0–100 של IGDB; ללא דירוג = נייטרלי, לא עונש. */
function communityScore(candidate: RecommendationCandidate): number {
  return candidate.communityRating == null ? 0.5 : candidate.communityRating / 100;
}

export type CandidateScore = { score: number; sessionFit: number };

/** §4.1 — נוסחת הניקוד + המכפילים/האיפוסים. */
export function scoreCandidate(
  candidate: RecommendationCandidate,
  input: RecommendationInput,
  now: Date
): CandidateScore {
  if (candidate.isHidden) return { score: 0, sessionFit: 0 };

  const fit = sessionFit(input.availableMinutes, candidate.sessionProfile);
  if (fit === 0) return { score: 0, sessionFit: fit };

  let score =
    fit * 0.4 +
    moodMatch(input.mood, candidate.genres) * 0.2 +
    momentum(candidate.status) * 0.2 +
    dustFactor(candidate, now) * 0.1 +
    communityScore(candidate) * 0.1;

  if (candidate.dismissedUntil && candidate.dismissedUntil > now) {
    score *= 0.3;
  }

  return { score, sessionFit: fit };
}
