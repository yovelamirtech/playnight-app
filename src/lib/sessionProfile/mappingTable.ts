import type { Archetype } from './archetypes';

/**
 * טבלת המיפוי מ-IGDB לארכיטיפים של §4.4.
 * IGDB לא מכיר "roguelike" כז'אנר, ולכן העדיפות היא:
 * keywords (מדויק) → themes → genres (גס) → ברירת מחדל שמרנית.
 * כל המפתחות בטבלאות האלה מנורמלים ל-lowercase.
 */

/** keywords הוא שדה פתוח ורועש — רק מה שברשימה הזאת נחשב. */
export const KEYWORD_TO_ARCHETYPE: Record<string, Archetype> = {
  roguelike: 'roguelike',
  'rogue-like': 'roguelike',
  roguelite: 'roguelike',
  'rogue-lite': 'roguelike',
  // אין `permadeath`: זה סימן חלש מדי. Minecraft (מצב hardcore) קיבל
  // בגללו פרופיל של roguelike. roguelike/roguelite כבר מכסים את זה.
  'run-based': 'roguelike',
  'deck-building': 'roguelike',
  'battle royale': 'battleRoyale',
  'battle-royale': 'battleRoyale',
  moba: 'moba',
  'multiplayer online battle arena': 'moba',
  'hero shooter': 'moba',
  'turn-based': 'turnBasedStrategy',
  'turn-based strategy': 'turnBasedStrategy',
  'turn based strategy': 'turnBasedStrategy',
  '4x': 'turnBasedStrategy',
  'grand strategy': 'turnBasedStrategy',
  jrpg: 'jrpg',
  'japanese role-playing game': 'jrpg',
  'visual novel': 'visualNovel',
  'dating sim': 'visualNovel',
  'point and click': 'visualNovel',
  puzzle: 'puzzle',
  'puzzle-solving': 'puzzle',
  'life simulation': 'simulation',
  farming: 'simulation',
  'city building': 'simulation',
  'colony sim': 'simulation',
  'open world': 'openWorldStory',
  'open-world': 'openWorldStory',
  sandbox: 'openWorldSandbox',
};

/** themes של IGDB — רשימה סגורה וקצרה, ולכן אמינה. */
export const THEME_TO_ARCHETYPE: Record<string, Archetype> = {
  '4x (explore, expand, exploit, and exterminate)': 'turnBasedStrategy',
  sandbox: 'openWorldSandbox',
  // "עולם פתוח" לבדו לא אומר שאפשר לצאת מתי שרוצים — Witcher 3 ו-Skyrim
  // מתויגים כך, וגם GTA. אותו ערך כמו ב-keywords, בכוונה: אותו מושג
  // חייב להוביל לאותו ארכיטיפ בלי קשר לשדה שבו IGDB שם אותו.
  'open world': 'openWorldStory',
};

/**
 * genres של IGDB — רשימה סגורה של כ-20 ערכים.
 * בכוונה חסרים כאן Indie, Arcade ו-Action: הם רחבים מדי
 * מכדי לומר משהו על מבנה הסשן.
 */
export const GENRE_TO_ARCHETYPE: Record<string, Archetype> = {
  puzzle: 'puzzle',
  'visual novel': 'visualNovel',
  'turn-based strategy (tbs)': 'turnBasedStrategy',
  'real time strategy (rts)': 'turnBasedStrategy',
  strategy: 'turnBasedStrategy',
  // אין `tactical`: ב-IGDB זה "יורה טקטי" (Counter-Strike, Rainbow Six),
  // לא משחק תורות. המיפוי הקודם נתן ל-CS:GO 60 דקות של "עוד תור אחד".
  simulator: 'simulation',
  'role-playing (rpg)': 'jrpg',
  adventure: 'narrative_linear',
  'point-and-click': 'visualNovel',
  // סשנים קצרים מבוססי-מאץ'. שלושת אלה חד-משמעיים ב-IGDB.
  racing: 'arcadeSession',
  fighting: 'arcadeSession',
  sport: 'arcadeSession',
  arcade: 'arcadeSession',
  pinball: 'arcadeSession',
};

export const normalizeTag = (tag: string): string => tag.trim().toLowerCase();
