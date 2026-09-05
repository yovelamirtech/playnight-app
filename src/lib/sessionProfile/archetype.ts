import { FALLBACK_PROFILE, genreSessionDefaults } from './archetypes';
import type { Archetype, SessionProfile } from './archetypes';
import {
  GENRE_TO_ARCHETYPE,
  KEYWORD_TO_ARCHETYPE,
  THEME_TO_ARCHETYPE,
  normalizeTag,
} from './mappingTable';

export type IgdbTags = {
  genres?: readonly string[];
  themes?: readonly string[];
  keywords?: readonly string[];
};

export type ArchetypeSource = 'keyword' | 'theme' | 'genre' | 'fallback';

export type ResolvedSessionProfile = SessionProfile & {
  archetype: Archetype | null;
  /** מאיזו שכבה הגיעה ההחלטה — שימושי לדיבוג ולמדידה מאוחרת. */
  source: ArchetypeSource;
};

/**
 * סדר העדיפויות בין ארכיטיפים, מהספציפי לגנרי.
 * IGDB מחזיר keywords בסדר שרירותי, ולכן אסור להסתמך על "ההתאמה הראשונה
 * ברשימה" — משחק עם גם "roguelike" וגם "open world" חייב לצאת roguelike
 * בכל פעם, לא לפי הסדר שבו IGDB במקרה החזיר את התגיות.
 */
const ARCHETYPE_PRIORITY: readonly Archetype[] = [
  'roguelike',
  'moba',
  'battleRoyale',
  'turnBasedStrategy',
  'visualNovel',
  'puzzle',
  'jrpg',
  'simulation',
  'arcadeSession',
  // openWorldStory לפני openWorldSandbox: משחק שמתויג גם Sandbox וגם
  // Open world (GTA) חייב לקבל את הפרופיל הזהיר, לא את הנדיב.
  'openWorldStory',
  'openWorldSandbox',
  'narrative_linear',
];

const bestMatch = (
  tags: readonly string[] | undefined,
  table: Record<string, Archetype>,
): Archetype | null => {
  const matched = new Set<Archetype>();
  for (const tag of tags ?? []) {
    const hit = table[normalizeTag(tag)];
    if (hit) matched.add(hit);
  }
  return ARCHETYPE_PRIORITY.find((archetype) => matched.has(archetype)) ?? null;
};

/**
 * פונקציה טהורה: תגיות IGDB → ארכיטיפ של §4.4.
 * סדר העדיפויות מכוון — keywords מדויקים בהרבה מז'אנרים.
 */
export function resolveArchetype(tags: IgdbTags): {
  archetype: Archetype | null;
  source: ArchetypeSource;
} {
  const byKeyword = bestMatch(tags.keywords, KEYWORD_TO_ARCHETYPE);
  if (byKeyword) return { archetype: byKeyword, source: 'keyword' };

  const byTheme = bestMatch(tags.themes, THEME_TO_ARCHETYPE);
  if (byTheme) return { archetype: byTheme, source: 'theme' };

  const byGenre = bestMatch(tags.genres, GENRE_TO_ARCHETYPE);
  if (byGenre) return { archetype: byGenre, source: 'genre' };

  return { archetype: null, source: 'fallback' };
}

/** מה שנכתב בפועל ל-games.typical_session_minutes ו-games.interruptible (§6). */
export function resolveSessionProfile(tags: IgdbTags): ResolvedSessionProfile {
  const { archetype, source } = resolveArchetype(tags);
  const profile = archetype ? genreSessionDefaults[archetype] : FALLBACK_PROFILE;
  return { ...profile, archetype, source };
}
