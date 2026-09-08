import { describe, expect, it } from 'vitest';

import { genreSessionDefaults } from '../sessionProfile/archetypes';
import { sessionFit } from './sessionFit';

describe('sessionFit (§4.4)', () => {
  it('roguelike (Hades) עם 20 דק׳ פנויות — התאמה מושלמת', () => {
    expect(sessionFit(20, genreSessionDefaults.roguelike)).toBe(1.0);
  });

  it('משחק נעול עם 20 דק׳ פנויות מול סשן 40 דק׳ — לא מוצע בכלל', () => {
    expect(sessionFit(20, genreSessionDefaults.openWorldStory)).toBe(0.0);
  });

  it('turn-based strategy (Civilization) עם 20 דק׳ — מסוכן, לא מוצע', () => {
    expect(sessionFit(20, genreSessionDefaults.turnBasedStrategy)).toBe(0.0);
  });

  it('שעתיים פנויות מול כל משחק — כמעט תמיד 1.0', () => {
    for (const profile of Object.values(genreSessionDefaults)) {
      expect(sessionFit(120, profile)).toBe(1.0);
    }
  });

  it('לא ניתן להפרעה, בדיוק על הגבול — 1.0', () => {
    expect(sessionFit(40, { typicalMinutes: 40, interruptible: false })).toBe(1.0);
  });

  it('לא ניתן להפרעה, "יהיה צמוד" (70%–99%) — 0.4', () => {
    expect(sessionFit(30, { typicalMinutes: 40, interruptible: false })).toBe(0.4);
  });

  it('ניתן להפרעה אבל מתחת ל-30% מהסשן הטיפוסי — 0.6, לא 0', () => {
    expect(sessionFit(4, { typicalMinutes: 15, interruptible: true })).toBe(0.6);
  });

  it('ניתן להפרעה, בדיוק על סף ה-30% — 1.0', () => {
    expect(sessionFit(4.5, { typicalMinutes: 15, interruptible: true })).toBe(1.0);
  });
});
