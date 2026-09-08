import { describe, expect, it } from 'vitest';

import { moodMatch } from './moodMatch';

describe('moodMatch (§4.1)', () => {
  it('ללא מצב רוח — נייטרלי (1)', () => {
    expect(moodMatch(null, ['Puzzle'])).toBe(1);
  });

  it('deep מתאים ל-RPG', () => {
    expect(moodMatch('deep', ['Role-playing (RPG)'])).toBe(1);
  });

  it('deep לא מתאים ל-Shooter', () => {
    expect(moodMatch('deep', ['Shooter'])).toBe(0);
  });

  it('action מתאים ל-"Hack and slash/Beat \'em up" של IGDB', () => {
    expect(moodMatch('action', ["Hack and slash/Beat 'em up"])).toBe(1);
  });

  it('chill מתאים ל-Simulator (case-insensitive, substring)', () => {
    expect(moodMatch('chill', ['Simulator'])).toBe(1);
  });

  it('התאמה אם לפחות ז׳אנר אחד תואם מתוך כמה', () => {
    expect(moodMatch('action', ['Adventure', 'Racing'])).toBe(1);
  });

  it('finish/fresh/surprise לא מבוססי-ז׳אנר — תמיד נייטרלי', () => {
    expect(moodMatch('finish', ['Puzzle'])).toBe(1);
    expect(moodMatch('fresh', ['Shooter'])).toBe(1);
    expect(moodMatch('surprise', [])).toBe(1);
  });
});
