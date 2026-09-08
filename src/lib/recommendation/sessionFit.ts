import type { SessionProfile } from '../sessionProfile/archetypes';

/**
 * §4.4 — הנוסחה הכי חשובה במנוע: האם הזמן הפנוי פיזית מתאים למבנה
 * הסשן של המשחק. משחק שניתן להפרעה (roguelike, Hades) מתאים כמעט
 * תמיד; משחק נעול (משימת GTA) לא מוצע בכלל אם אין מספיק זמן לסיים.
 */
export function sessionFit(availableMinutes: number, profile: SessionProfile): number {
  const { typicalMinutes, interruptible } = profile;

  if (interruptible) {
    return availableMinutes >= typicalMinutes * 0.3 ? 1.0 : 0.6;
  }

  if (availableMinutes >= typicalMinutes) return 1.0;
  if (availableMinutes >= typicalMinutes * 0.7) return 0.4;
  return 0.0;
}
