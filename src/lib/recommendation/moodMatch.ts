import type { MoodId } from '@/constants/session';

/**
 * §4.1 — מיפוי מצב רוח לז'אנרים. רלוונטי רק ל-deep/action/chill.
 * finish/fresh/surprise לא מבוססי-ז'אנר — מטופלים בפילטור/מיון
 * ב-recommend.ts, ולכן לא מופיעים כאן (moodMatch מחזיר להם 1, נייטרלי).
 * ההתאמות הן substring על שמות הז'אנר הגולמיים של IGDB (case-insensitive),
 * לא מילון מדויק — כדי לשרוד ניסוחים כמו "Hack and slash/Beat 'em up".
 */
const MOOD_GENRE_KEYWORDS: Partial<Record<MoodId, string[]>> = {
  deep: ['role-playing', 'rpg', 'adventure', 'strategy', 'visual novel'],
  action: ['shooter', 'fighting', 'racing', 'hack and slash', "beat 'em up"],
  chill: ['simulat', 'puzzle', 'farming', 'card', 'point-and-click'],
};

const normalize = (genre: string): string => genre.trim().toLowerCase();

export function moodMatch(mood: MoodId | null, genres: string[]): number {
  if (!mood) return 1;

  const keywords = MOOD_GENRE_KEYWORDS[mood];
  if (!keywords) return 1;

  const normalizedGenres = genres.map(normalize);
  const matches = keywords.some((keyword) =>
    normalizedGenres.some((genre) => genre.includes(keyword))
  );
  return matches ? 1 : 0;
}
