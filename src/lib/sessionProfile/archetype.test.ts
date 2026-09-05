import { describe, expect, it } from 'vitest';

import { resolveArchetype, resolveSessionProfile } from './archetype';
import { FALLBACK_PROFILE } from './archetypes';

describe('resolveArchetype priority', () => {
  it('prefers a keyword over a genre', () => {
    // מטען אמיתי מ-IGDB. הז'אנרים היו שולחים את Hades ל-jrpg (45 דק', נעול);
    // ה-keyword הוא היחיד שיודע שזה roguelike.
    const result = resolveArchetype({
      genres: ['Role-playing (RPG)', "Hack and slash/Beat 'em up", 'Adventure', 'Indie'],
      themes: ['Action', 'Fantasy', 'Drama'],
      keywords: [
        'greek mythology',
        'roguelike',
        'difficult',
        'dungeon crawler',
        'story rich',
        'netflix',
        'you can pet the dog',
      ],
    });
    expect(result).toEqual({ archetype: 'roguelike', source: 'keyword' });
  });

  it('does not depend on the order IGDB happens to return keywords in', () => {
    const forward = resolveArchetype({ keywords: ['open world', 'roguelike'] });
    const reversed = resolveArchetype({ keywords: ['roguelike', 'open world'] });
    expect(forward).toEqual(reversed);
    expect(forward.archetype).toBe('roguelike');
  });

  it('ignores keyword noise that is not on the whitelist', () => {
    const result = resolveArchetype({
      keywords: ['netflix', 'you can pet the dog', 'the game awards - best score - nominee'],
    });
    expect(result).toEqual({ archetype: null, source: 'fallback' });
  });

  it('reads "open world" the same way whether it lands in themes or keywords', () => {
    // מטען אמיתי: IGDB מתייגת את Witcher 3 ו-Skyrim עם theme "Open world"
    // ובלי keyword מקביל. שני המסלולים חייבים להגיע לאותה תשובה שמרנית.
    const viaTheme = resolveSessionProfile({
      genres: ['Role-playing (RPG)', 'Adventure'],
      themes: ['Action', 'Fantasy', 'Open world'],
    });
    const viaKeyword = resolveSessionProfile({ keywords: ['open world'] });
    expect(viaTheme.archetype).toBe('openWorldStory');
    expect(viaKeyword.archetype).toBe('openWorldStory');
    expect(viaTheme.interruptible).toBe(false);
  });

  it('falls back to a theme when no keyword matches', () => {
    const result = resolveArchetype({
      genres: ['Simulator'],
      themes: ['Sandbox'],
      keywords: ['building'],
    });
    expect(result).toEqual({ archetype: 'openWorldSandbox', source: 'theme' });
  });

  it('falls back to a genre when nothing else matches', () => {
    const result = resolveArchetype({ genres: ['Puzzle'], keywords: ['relaxing'] });
    expect(result).toEqual({ archetype: 'puzzle', source: 'genre' });
  });

  it('ignores genres that say nothing about session structure', () => {
    const result = resolveArchetype({ genres: ['Indie', 'Action'] });
    expect(result).toEqual({ archetype: null, source: 'fallback' });
  });

  it('is case- and whitespace-insensitive', () => {
    expect(resolveArchetype({ keywords: ['  RogueLike '] }).archetype).toBe('roguelike');
  });

  it('handles a game with no tags at all', () => {
    expect(resolveArchetype({})).toEqual({ archetype: null, source: 'fallback' });
  });
});

describe('resolveSessionProfile', () => {
  it('gives Hades a short interruptible session', () => {
    const profile = resolveSessionProfile({ keywords: ['roguelike'] });
    expect(profile.typicalMinutes).toBe(15);
    expect(profile.interruptible).toBe(true);
  });

  it('gives Civilization a long uninterruptible session', () => {
    const profile = resolveSessionProfile({
      genres: ['Strategy', 'Simulator'],
      keywords: ['turn-based'],
    });
    expect(profile.typicalMinutes).toBe(60);
    expect(profile.interruptible).toBe(false);
  });

  it('treats a bare open-world game conservatively', () => {
    const profile = resolveSessionProfile({ keywords: ['open world'] });
    expect(profile).toMatchObject({ typicalMinutes: 40, interruptible: false });
  });

  it('uses the conservative fallback for unrecognised games', () => {
    const profile = resolveSessionProfile({ genres: ['Music'] });
    expect(profile).toMatchObject(FALLBACK_PROFILE);
    expect(profile.archetype).toBeNull();
  });
});

describe('regressions found while tagging real IGDB data', () => {
  it('keeps GTA conservative even though IGDB tags it Sandbox as well', () => {
    const profile = resolveSessionProfile({
      genres: ['Shooter', 'Racing', 'Adventure'],
      themes: ['Action', 'Open world', 'Sandbox'],
    });
    expect(profile.archetype).toBe('openWorldStory');
    expect(profile.interruptible).toBe(false);
  });

  it('does not read a tactical shooter as a turn-based strategy game', () => {
    // CS:GO — IGDB נותנת לו את הז'אנר Tactical.
    const profile = resolveSessionProfile({ genres: ['Shooter', 'Tactical'] });
    expect(profile.archetype).not.toBe('turnBasedStrategy');
  });

  it('still reads a pure sandbox as a sandbox', () => {
    const profile = resolveSessionProfile({ genres: ['Simulator'], themes: ['Sandbox'] });
    expect(profile.archetype).toBe('openWorldSandbox');
  });
});

describe('short match-based games (arcadeSession)', () => {
  it.each([
    ['Rocket League', ['Sport', 'Racing', 'Indie']],
    ['FIFA', ['Sport', 'Simulator']],
    ['Tekken', ['Fighting', 'Arcade']],
    ['Mario Kart', ['Racing']],
  ])('offers %s to a short evening', (_name, genres) => {
    const profile = resolveSessionProfile({ genres });
    expect(profile.interruptible).toBe(true);
    expect(profile.typicalMinutes).toBeLessThanOrEqual(20);
  });

  it('does not turn GTA into a ten-minute game just because IGDB tags it Racing', () => {
    // מטען אמיתי: הז'אנרים של GTA V כוללים Racing, אבל ה-keyword
    // open world חייב לגבור עליו.
    const profile = resolveSessionProfile({
      genres: ['Shooter', 'Racing', 'Adventure'],
      themes: ['Action', 'Open world'],
      keywords: ['open world', 'crime'],
    });
    expect(profile.archetype).toBe('openWorldStory');
    expect(profile.typicalMinutes).toBe(40);
    expect(profile.interruptible).toBe(false);
  });
});
