import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * קובץ ה-seed. נשמר אחרי כל תשובה — 300 משחקים זה כמה ישיבות,
 * ואסור שסגירת חלון תמחק עבודה.
 */
export type SeedEntry = {
  igdbId: number;
  name: string;
  typicalMinutes: number;
  interruptible: boolean;
  /** מה המיפוי האוטומטי ניחש — כדי שנוכל למדוד כמה פעמים הוא טעה. */
  guessedArchetype: string | null;
  agreedWithGuess: boolean;
  taggedAt: string;
};

export type SeedFile = {
  version: 1;
  entries: SeedEntry[];
};

const EMPTY: SeedFile = { version: 1, entries: [] };

export function loadSeed(path: string): SeedFile {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as SeedFile;
    if (!Array.isArray(parsed.entries)) return { ...EMPTY };
    return parsed;
  } catch {
    return { ...EMPTY };
  }
}

export function saveSeed(path: string, seed: SeedFile): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(seed, null, 2)}\n`, 'utf8');
}

export function upsertEntry(seed: SeedFile, entry: SeedEntry): SeedFile {
  const entries = seed.entries.filter((existing) => existing.igdbId !== entry.igdbId);
  entries.push(entry);
  return { ...seed, entries };
}
