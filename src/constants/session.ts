/** אפשרויות הזמן במסך הבית (SPEC §3.2). התוויות נמצאות ב-i18n. */
export const TIME_OPTIONS = [30, 60, 120, 240] as const;

export type TimeOptionMinutes = (typeof TIME_OPTIONS)[number];

/** מצבי רוח (SPEC §3.2 + מיפוי לז'אנרים ב-§4.1). */
export const MOODS = [
  { id: 'deep', emoji: '🧠' },
  { id: 'action', emoji: '⚡' },
  { id: 'chill', emoji: '😌' },
  { id: 'finish', emoji: '🎯' },
  { id: 'fresh', emoji: '🆕' },
  { id: 'surprise', emoji: '🎲' },
] as const;

export type MoodId = (typeof MOODS)[number]['id'];

/** פלטפורמות שהמשתמש יכול לשייך אליהן עותק (§3.1, §4.3). */
export const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Epic', 'GOG', 'Mobile'] as const;

export type PlatformName = (typeof PLATFORMS)[number];
