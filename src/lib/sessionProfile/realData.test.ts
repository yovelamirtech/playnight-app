import { describe, expect, it } from 'vitest';

import seedProfiles from '../../../seed/session-profiles.json';
import seedTags from '../../../seed/session-profile-tags.json';
import { resolveSessionProfile } from './archetype';
import { getSeedOverride } from './seedOverrides';

type SeedEntry = {
  igdbId: number;
  typicalMinutes: number;
  interruptible: boolean;
};
type TagEntry = { igdbId: number; name: string; genres: string[]; themes: string[]; keywords: string[] };

const entries = (seedProfiles as { entries: SeedEntry[] }).entries;
const tagsByIgdbId = new Map(
  (seedTags as { entries: TagEntry[] }).entries.map((entry) => [entry.igdbId, entry]),
);

/** אותם 4 באקטים שכלי התיוג (tools/tagger/page.html) מציע למתייג. */
const BUCKETS = [10, 20, 45, 75];
const bucketFor = (minutes: number): number =>
  BUCKETS.reduce((best, candidate) =>
    Math.abs(candidate - minutes) < Math.abs(best - minutes) ? candidate : best,
  );

describe('seed overrides (§4.5 tagging data)', () => {
  it('has real tag data cached for every tagged game', () => {
    // אם זה נופל, seed/session-profile-tags.json לא מסונכרן עם
    // seed/session-profiles.json — תריץ מחדש את משיכת התגיות.
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(tagsByIgdbId.has(entry.igdbId)).toBe(true);
    }
  });

  it('returns the exact human-tagged value for every game in the seed', () => {
    for (const entry of entries) {
      expect(getSeedOverride(entry.igdbId)).toEqual({
        typicalMinutes: entry.typicalMinutes,
        interruptible: entry.interruptible,
      });
    }
  });

  it('returns null for a game nobody has tagged', () => {
    expect(getSeedOverride(-1)).toBeNull();
  });
});

describe('archetype mapping table vs. real IGDB tags (§4.4 bootstrap quality)', () => {
  it('keeps the archetype-guess bucket-agreement rate from regressing', () => {
    // מדד אמת: 300 משחקים תויגו ידנית מול הניחוש של הארכיטיפ (§4.5 tagging
    // run, 2026-09). כל שינוי במיפוי (mappingTable.ts) חייב לפחות לשמור
    // על שיעור ההסכמה הזה, לא לפגוע בו. הרף נמוך בכוונה מהערך שנמדד
    // בפועל (~56.7%) — זה guard נגד רגרסיה, לא יעד מדויק שצריך להכות בו.
    let agree = 0;
    for (const entry of entries) {
      const tags = tagsByIgdbId.get(entry.igdbId);
      if (!tags) continue;
      const guess = resolveSessionProfile(tags);
      const bucketMatches = bucketFor(guess.typicalMinutes) === bucketFor(entry.typicalMinutes);
      if (bucketMatches && guess.interruptible === entry.interruptible) agree += 1;
    }
    expect(agree / entries.length).toBeGreaterThanOrEqual(0.5);
  });

  it('no longer sends a broad "Strategy"-genre game to turnBasedStrategy on its own', () => {
    // רגרסיה קונקרטית מהנתונים האמיתיים: Overwatch ו-Battlefield 4 קיבלו
    // 60 דק' נעולות בגלל ז'אנר Strategy גס, בעוד שבפועל הם לא-אסטרטגיה
    // מבוססת-תורות בכלל.
    for (const name of ['Overwatch', 'Battlefield 4']) {
      const tags = [...tagsByIgdbId.values()].find((entry) => entry.name === name);
      expect(tags, `no cached tags for ${name}`).toBeDefined();
      expect(resolveSessionProfile(tags as TagEntry).archetype).not.toBe('turnBasedStrategy');
    }
  });
});
