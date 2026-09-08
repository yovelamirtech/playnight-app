import type { MoodId } from '@/constants/session';
import type { UserGameStatus } from '@/db/schema';

import type { SessionProfile } from '../sessionProfile/archetypes';

/**
 * מועמד להמלצה — תערובת שדות מ-games + user_games (§6) שהמנוע צריך
 * כדי לנקד לפי §4.1. נשמר עצמאי מ-DB (רק שאילת טיפוסים), כדי שכל
 * הלוגיקה ב-lib/recommendation תישאר פונקציה טהורה.
 */
export type RecommendationCandidate = {
  userGameId: string;
  gameId: string;
  name: string;
  genres: string[];
  sessionProfile: SessionProfile;
  communityRating: number | null;
  status: UserGameStatus;
  hoursPlayed: number;
  addedAt: Date;
  lastPlayedAt: Date | null;
  progressPercent: number | null;
  isHidden: boolean;
  dismissedUntil: Date | null;
};

/** הבחירה במסך הבית (§3.2) — ראה useDecisionStore. */
export type RecommendationInput = {
  availableMinutes: number;
  mood: MoodId | null;
};

export type ScoredCandidate = {
  candidate: RecommendationCandidate;
  score: number;
  sessionFit: number;
};
