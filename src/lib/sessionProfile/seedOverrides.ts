import seedData from '../../../seed/session-profiles.json';

export type SeedOverride = { typicalMinutes: number; interruptible: boolean };

type SeedEntry = { igdbId: number; typicalMinutes: number; interruptible: boolean };
type SeedFile = { version: 1; entries: SeedEntry[] };

const overridesByIgdbId: ReadonlyMap<number, SeedOverride> = new Map(
  (seedData as SeedFile).entries.map((entry) => [
    entry.igdbId,
    { typicalMinutes: entry.typicalMinutes, interruptible: entry.interruptible },
  ]),
);

/**
 * תיוג ידני אמיתי (§4.5, tools/tagger) לכ-300 המשחקים הפופולריים ביותר
 * ב-IGDB. עדיף על ברירת המחדל של הארכיטיפ (§4.4) כי הוא נתון אמיתי,
 * לא ניחוש. בכוונה לא מסמן is_calibrated — §4.5 ממשיך לאסוף דיווחי סשן
 * אמיתיים על המשחקים האלה גם כן, ומחליף בהדרגה גם את התיוג הידני הזה.
 */
export function getSeedOverride(igdbId: number): SeedOverride | null {
  return overridesByIgdbId.get(igdbId) ?? null;
}
