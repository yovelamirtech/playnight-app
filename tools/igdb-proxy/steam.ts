const STEAM_API_BASE = 'https://api.steampowered.com';

export type SteamCredentials = { apiKey: string };

export type RawSteamGame = {
  appid: number;
  name: string;
  playtime_forever: number;
};

export class SteamApiError extends Error {}

async function steamGet(path: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(`${STEAM_API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url);
  if (!response.ok) {
    throw new SteamApiError(`Steam request failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

/** ResolveVanityURL — ממיר שם פרופיל מותאם (למשל /id/foo) ל-SteamID64. */
export async function resolveVanityUrl(
  vanityUrl: string,
  credentials: SteamCredentials,
): Promise<string> {
  const body = (await steamGet('/ISteamUser/ResolveVanityURL/v0001/', {
    key: credentials.apiKey,
    vanityurl: vanityUrl,
  })) as { response?: { success?: number; steamid?: string; message?: string } };

  const result = body.response;
  if (!result || result.success !== 1 || !result.steamid) {
    throw new SteamApiError(result?.message ?? `Steam profile "${vanityUrl}" not found`);
  }
  return result.steamid;
}

/**
 * GetOwnedGames. אם "Game details" בפרטיות הפרופיל אינו Public, Steam
 * מחזיר תשובה תקינה בלי שדה games בכלל — לא שגיאת HTTP.
 */
export async function getOwnedGames(
  steamId: string,
  credentials: SteamCredentials,
): Promise<RawSteamGame[]> {
  const body = (await steamGet('/IPlayerService/GetOwnedGames/v0001/', {
    key: credentials.apiKey,
    steamid: steamId,
    include_appinfo: '1',
    include_played_free_games: '1',
  })) as { response?: { games?: RawSteamGame[] } };

  if (!body.response || !body.response.games) {
    throw new SteamApiError(
      'No games returned. Is the "Game details" privacy setting on this Steam profile set to Public?',
    );
  }
  return body.response.games;
}
