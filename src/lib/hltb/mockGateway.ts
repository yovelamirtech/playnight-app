import type { HltbGateway, HltbMatch } from './types';

/** מימוש אופליין — מאפשר לבנות ולבדוק את תצוגת "זמן להשלמה" בלי פרוקסי. */
const FIXTURES: HltbMatch[] = [
  {
    hltbId: 3877,
    name: 'Hades',
    mainStoryMinutes: 22 * 60,
    mainExtraMinutes: 37 * 60,
    completionistMinutes: 62 * 60,
  },
  {
    hltbId: 10270,
    name: 'The Legend of Zelda: Breath of the Wild',
    mainStoryMinutes: 51 * 60,
    mainExtraMinutes: 96 * 60,
    completionistMinutes: 176 * 60,
  },
  {
    hltbId: 4212,
    name: 'Grand Theft Auto V',
    mainStoryMinutes: 32 * 60,
    mainExtraMinutes: 48 * 60,
    completionistMinutes: 80 * 60,
  },
];

export const createMockHltbGateway = (): HltbGateway => ({
  kind: 'mock',
  async search(query) {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return FIXTURES.filter((game) => game.name.toLowerCase().includes(needle));
  },
});
