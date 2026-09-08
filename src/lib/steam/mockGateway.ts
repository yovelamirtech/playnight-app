import type { SteamGateway, SteamOwnedGame } from './types';
import { SteamImportError } from './types';

/** מימוש אופליין — מאפשר לבנות ולבדוק את מסך חיבור Steam בלי פרוקסי. */
const FIXTURE_STEAM_ID = '76561197960287930';

const FIXTURES: SteamOwnedGame[] = [
  {
    appId: 620,
    name: 'Portal 2',
    playtimeMinutes: 734,
    coverUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/620/header.jpg',
  },
  {
    appId: 292030,
    name: 'The Witcher 3: Wild Hunt',
    playtimeMinutes: 5211,
    coverUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
  },
];

export const createMockSteamGateway = (): SteamGateway => ({
  kind: 'mock',
  async resolveVanityUrl(vanityUrl) {
    if (!vanityUrl.trim()) throw new SteamImportError('Steam profile not found');
    return FIXTURE_STEAM_ID;
  },
  async getOwnedGames(steamId) {
    return steamId === FIXTURE_STEAM_ID ? FIXTURES : [];
  },
});
