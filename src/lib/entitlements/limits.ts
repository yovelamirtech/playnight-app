/**
 * מגבלות "חינם" מול Pro (SPEC §5). כולן פונקציות טהורות — נבדק count קיים
 * מול הסף, בלי לגעת ב-DB. אכיפה קשיחה: כשמוחזר false, הקורא חוסם את
 * הפעולה ומנתב ל-/paywall (הוחלט עם המשתמש, לא רק אינדיקציה).
 */

export const FREE_LIBRARY_LIMIT = 50;
export const FREE_PLATFORM_LIMIT = 1;
export const FREE_STOPPED_NOTES_LIMIT = 20;
export const FREE_SWIPE_RECOMMENDATIONS_LIMIT = 3;

export function canAddGame(currentLibraryCount: number, isPro: boolean): boolean {
  return isPro || currentLibraryCount < FREE_LIBRARY_LIMIT;
}

/** "פלטפורמה אחת" בחינם — נבדק מול הפלטפורמות השונות שכבר קיימות בספרייה. */
export function canConnectPlatform(
  connectedPlatforms: readonly string[],
  newPlatform: string,
  isPro: boolean
): boolean {
  if (isPro) return true;
  const distinct = new Set(connectedPlatforms);
  if (distinct.has(newPlatform)) return true;
  return distinct.size < FREE_PLATFORM_LIMIT;
}

export function canAddStoppedNote(currentNotesCount: number, isPro: boolean): boolean {
  return isPro || currentNotesCount < FREE_STOPPED_NOTES_LIMIT;
}

export function maxSwipeRecommendations(isPro: boolean): number {
  return isPro ? Infinity : FREE_SWIPE_RECOMMENDATIONS_LIMIT;
}
