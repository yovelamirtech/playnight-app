/** התוצאה המנורמלית שהאפליקציה מכירה. לא הצורה הגולמית של Steam. */
export type SteamOwnedGame = {
  appId: number;
  name: string;
  playtimeMinutes: number;
  coverUrl: string;
};

/**
 * הממשק היחיד שה-UI מכיר (§4.3). בפיתוח בלי פרוקסי — mockGateway.
 * מול הפרוקסי — httpGateway, על אותו שרת שמריץ את ה-IGDB proxy.
 */
export interface SteamGateway {
  readonly kind: 'mock' | 'http';
  resolveVanityUrl(vanityUrl: string): Promise<string>;
  getOwnedGames(steamId: string): Promise<SteamOwnedGame[]>;
}

export class SteamNotConfiguredError extends Error {
  constructor() {
    super('Steam gateway is not configured');
    this.name = 'SteamNotConfiguredError';
  }
}

/** שגיאה שמגיעה מ-Steam עצמו (פרופיל לא נמצא, ספרייה פרטית וכו') — טקסט שמוצג למשתמש. */
export class SteamImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SteamImportError';
  }
}
