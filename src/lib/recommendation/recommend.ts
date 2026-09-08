import { scoreCandidate } from './score';
import type { RecommendationCandidate, RecommendationInput, ScoredCandidate } from './types';

/** §3.3 — 3–5 כרטיסים בסוואיפ, לא יותר. */
const RESULT_LIMIT = 5;

/** מוזרק כדי שהמיון/הבחירה המשוקללת יהיו דטרמיניסטיים בטסטים. */
export type RandomFn = () => number;

function isNeverPlayed(candidate: RecommendationCandidate): boolean {
  return candidate.hoursPlayed === 0 && candidate.lastPlayedAt === null;
}

function sortByScore(scored: ScoredCandidate[]): ScoredCandidate[] {
  return [...scored].sort((a, b) => b.score - a.score);
}

function sortByProgress(scored: ScoredCandidate[]): ScoredCandidate[] {
  return [...scored].sort(
    (a, b) => (b.candidate.progressPercent ?? 0) - (a.candidate.progressPercent ?? 0)
  );
}

/** בחירה רנדומלית משוקללת לפי score, ללא השבה, מתוך entries. */
function weightedIndex(entries: ScoredCandidate[], random: RandomFn): number {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.score, 0);
  if (totalWeight === 0) return Math.floor(random() * entries.length);

  let roll = random() * totalWeight;
  for (let i = 0; i < entries.length; i += 1) {
    roll -= entries[i].score;
    if (roll <= 0) return i;
  }
  return entries.length - 1;
}

function weightedSample(
  entries: ScoredCandidate[],
  count: number,
  random: RandomFn
): ScoredCandidate[] {
  const pool = [...entries];
  const picked: ScoredCandidate[] = [];
  while (pool.length > 0 && picked.length < count) {
    const index = weightedIndex(pool, random);
    picked.push(pool[index]);
    pool.splice(index, 1);
  }
  return picked;
}

/**
 * §4.1: "תמיד לערבב לפחות כרטיס אחד לא צפוי מתוך ה-5" — המקום האחרון
 * בטופ מוחלף במשחק שנבחר רנדומלית (משוקלל לפי score) מתוך השאר.
 */
function mixInSurprise(sorted: ScoredCandidate[], random: RandomFn): ScoredCandidate[] {
  if (sorted.length <= RESULT_LIMIT) return sorted;

  const top = sorted.slice(0, RESULT_LIMIT - 1);
  const rest = sorted.slice(RESULT_LIMIT - 1);
  const surprise = rest[weightedIndex(rest, random)];
  return [...top, surprise];
}

/**
 * §4.1 + §4.4 — נקודת הכניסה היחידה של מנוע ההמלצה. לוקחת את כל
 * מועמדי הספרייה, מנקדת, ומחזירה עד 5 כרטיסים לפי מצב הרוח:
 * - fresh: מסונן מראש למשחקים שמעולם לא הופעלו (§4.1)
 * - finish: ממוין לפי "הכי קרוב לסיום" (progressPercent), לא score (§4.1)
 * - surprise: דגימה רנדומלית משוקללת מכל המועמדים (§4.1)
 * - אחרת (deep/action/chill/null): ממוין לפי score, עם כרטיס "לא צפוי" אחד
 */
export function getRecommendations(
  candidates: RecommendationCandidate[],
  input: RecommendationInput,
  now: Date = new Date(),
  random: RandomFn = Math.random
): ScoredCandidate[] {
  const pool = input.mood === 'fresh' ? candidates.filter(isNeverPlayed) : candidates;

  const scored = pool
    .map((candidate) => {
      const { score, sessionFit } = scoreCandidate(candidate, input, now);
      return { candidate, score, sessionFit };
    })
    .filter((entry) => entry.score > 0);

  if (input.mood === 'finish') {
    return sortByProgress(scored).slice(0, RESULT_LIMIT);
  }

  if (input.mood === 'surprise') {
    return weightedSample(scored, RESULT_LIMIT, random);
  }

  return mixInSurprise(sortByScore(scored), random).slice(0, RESULT_LIMIT);
}
