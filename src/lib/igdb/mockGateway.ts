import type { IgdbGame, IgdbGateway } from './types';

/**
 * מימוש אופליין — מאפשר לבנות ולבדוק את ה-UI של החיפוש בלי פרוקסי.
 * הנתונים תואמים למה ש-IGDB באמת מחזיר, כולל keywords, כדי שמיפוי
 * הארכיטיפים (§4.4) ייבדק על צורה אמיתית.
 */
const FIXTURES: IgdbGame[] = [
  {
    igdbId: 113112,
    name: 'Hades',
    coverUrl: null,
    releaseYear: 2020,
    genres: ['Indie', "Hack and slash/Beat 'em up", 'Adventure'],
    platforms: ['PC', 'NSW', 'PS5'],
    communityRating: 91,
    themes: ['Action', 'Fantasy'],
    keywords: ['roguelike', 'greek mythology', 'permadeath'],
  },
  {
    igdbId: 7346,
    name: 'The Legend of Zelda: Breath of the Wild',
    coverUrl: null,
    releaseYear: 2017,
    genres: ['Role-playing (RPG)', 'Adventure'],
    platforms: ['NSW', 'WiiU'],
    communityRating: 94,
    themes: ['Action', 'Fantasy', 'Open world'],
    keywords: ['open world', 'exploration'],
  },
  {
    igdbId: 1020,
    name: 'Grand Theft Auto V',
    coverUrl: null,
    releaseYear: 2013,
    genres: ['Shooter', 'Racing', 'Adventure'],
    platforms: ['PC', 'PS5', 'XSX'],
    communityRating: 89,
    themes: ['Action', 'Open world'],
    keywords: ['open world', 'crime'],
  },
  {
    igdbId: 30326,
    name: 'Slay the Spire',
    coverUrl: null,
    releaseYear: 2019,
    genres: ['Card & Board Game', 'Indie', 'Strategy'],
    platforms: ['PC', 'NSW'],
    communityRating: 88,
    themes: ['Fantasy'],
    keywords: ['roguelike', 'deck-building'],
  },
  {
    igdbId: 1372,
    name: 'Sid Meier\u2019s Civilization VI',
    coverUrl: null,
    releaseYear: 2016,
    genres: ['Strategy', 'Turn-based strategy (TBS)', 'Simulator'],
    platforms: ['PC', 'NSW'],
    communityRating: 82,
    themes: ['Historical', '4X (explore, expand, exploit, and exterminate)'],
    keywords: ['turn-based', '4x'],
  },
];

export const createMockIgdbGateway = (): IgdbGateway => ({
  kind: 'mock',
  async searchGames(query, options = {}) {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return FIXTURES.filter((game) => game.name.toLowerCase().includes(needle)).slice(
      0,
      options.limit ?? 20,
    );
  },
});
