/**
 * ערכי התשובות לשאלות 2–4 מבנק השאלות (§4.5) + ההמרות הטהורות שהן מזינות.
 * שאלה #1 (yes/no/depends) נשארת ב-sessionsRepo, ששם היא כבר הייתה.
 * שאלה #5 (תיקון תיוג מצב-רוח) נשארת גולמית בכוונה — ראה sessionsRepo.
 */
export const SESSION_LENGTH_BUCKETS = ['short', 'medium', 'long', 'veryLong'] as const;
export type SessionLengthBucket = (typeof SESSION_LENGTH_BUCKETS)[number];

export const SAVE_FREQUENCIES = ['frequent', 'betweenChapters', 'rare'] as const;
export type SaveFrequency = (typeof SAVE_FREQUENCIES)[number];

export const SESSION_STYLES = ['quickJump', 'longSit', 'both'] as const;
export type SessionStyle = (typeof SESSION_STYLES)[number];

/** נקודת האמצע של כל טווח בשאלה #2 — מוזן ל-nextTypicalMinutes כמו דיווח סשן רגיל. */
export const SESSION_LENGTH_BUCKET_MINUTES: Record<SessionLengthBucket, number> = {
  short: 10,
  medium: 22,
  long: 45,
  veryLong: 75,
};

/** שאלה #3 "תוסף ל-interruptible" (§4.5): שמירה תכופה = אפשר לעצור מתי שרוצים. */
export function saveFrequencyLeansInterruptible(value: SaveFrequency): boolean {
  return value === 'frequent';
}
