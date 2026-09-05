/**
 * ברירות המחדל של פרופיל הסשן, מילה במילה מ-SPEC §4.4.
 * זו נקודת הפתיחה בלבד — §4.5 מחליף אותה בהדרגה בנתוני משתמשים אמיתיים.
 */
export type Archetype =
  | 'roguelike'
  | 'battleRoyale'
  | 'moba'
  | 'openWorldSandbox'
  | 'openWorldStory'
  | 'turnBasedStrategy'
  | 'jrpg'
  | 'puzzle'
  | 'visualNovel'
  | 'narrative_linear'
  | 'simulation'
  | 'arcadeSession';

export type SessionProfile = {
  typicalMinutes: number;
  interruptible: boolean;
};

export const genreSessionDefaults: Record<Archetype, SessionProfile> = {
  roguelike: { typicalMinutes: 15, interruptible: true },
  battleRoyale: { typicalMinutes: 25, interruptible: false },
  moba: { typicalMinutes: 30, interruptible: false },
  openWorldSandbox: { typicalMinutes: 20, interruptible: true },
  openWorldStory: { typicalMinutes: 40, interruptible: false },
  turnBasedStrategy: { typicalMinutes: 60, interruptible: false },
  jrpg: { typicalMinutes: 45, interruptible: false },
  puzzle: { typicalMinutes: 10, interruptible: true },
  visualNovel: { typicalMinutes: 20, interruptible: true },
  narrative_linear: { typicalMinutes: 50, interruptible: false },
  simulation: { typicalMinutes: 20, interruptible: true },
  /**
   * לא מופיע ב-§4.4 — נוסף אחרי שהתברר שאין בטבלה שום ערך למשחקים
   * מבוססי-מאץ' קצר (Rocket League, FIFA, Tekken, Mario Kart).
   * בלעדיו הם נפלו לברירת המחדל השמרנית ולא הוצעו לערב קצר,
   * בדיוק הפוך מהאמת. המאץ' עצמו נעול, אבל הוא בן דקות בודדות,
   * ולכן ברמת הסשן אפשר לעצור אחרי כל סיבוב.
   */
  arcadeSession: { typicalMinutes: 10, interruptible: true },
};

/**
 * ברירת מחדל שמרנית לכל מה שלא זוהה.
 * שמרנית = "אל תציע את זה לחלון זמן קצר" ולא "כן, תיכנס" —
 * טעות לכיוון הזה עולה למשתמש פחות (§4.4).
 */
export const FALLBACK_PROFILE: SessionProfile = { typicalMinutes: 40, interruptible: false };
