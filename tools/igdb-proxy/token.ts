const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';

export type IgdbCredentials = { clientId: string; clientSecret: string };

type CachedToken = { token: string; expiresAt: number };

let cached: CachedToken | null = null;

/**
 * IGDB מאומת דרך Twitch: app access token שתקף כ-60 יום.
 * שומרים אותו בזיכרון ומחדשים דקה לפני שהוא פג.
 */
export async function getAccessToken({ clientId, clientSecret }: IgdbCredentials): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });

  const response = await fetch(`${TOKEN_URL}?${params}`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Twitch token request failed (${response.status}): ${await response.text()}`);
  }

  const body = (await response.json()) as { access_token: string; expires_in: number };
  cached = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in - 60) * 1000,
  };
  return cached.token;
}
