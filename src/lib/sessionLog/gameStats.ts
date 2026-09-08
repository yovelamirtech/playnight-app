/**
 * §4.4/§6 — עדכון הדדתי של פרופיל הסשן ברמת games מתוך דיווחים אמיתיים.
 * פונקציות טהורות: sessionsRepo מזין להן ספירות מה-DB ומכתיב את התוצאה חזרה.
 */

/** ממוצע נע פשוט — כל דיווח חדש שוקל שווה. */
export function nextTypicalMinutes(
  currentTypicalMinutes: number,
  priorReportsCount: number,
  newDurationMinutes: number
): number {
  if (priorReportsCount <= 0) return Math.round(newDurationMinutes);
  const total = currentTypicalMinutes * priorReportsCount + newDurationMinutes;
  return Math.round(total / (priorReportsCount + 1));
}

/** רוב פשוט מתוך תשובות "כן"/"לא" לשאלת הכיול #1 (§4.5). */
export function nextInterruptible(
  yesAnswersCount: number,
  totalAnswersCount: number,
  currentInterruptible: boolean
): boolean {
  if (totalAnswersCount <= 0) return currentInterruptible;
  return yesAnswersCount / totalAnswersCount >= 0.5;
}

const CALIBRATED_THRESHOLD = 15;

export function isCalibrated(sessionReportsCount: number): boolean {
  return sessionReportsCount >= CALIBRATED_THRESHOLD;
}
