/** התוצאה המנורמלית שהאפליקציה מכירה. לא הצורה הגולמית של IGDB. */
export type IgdbGame = {
  igdbId: number;
  name: string;
  coverUrl: string | null;
  releaseYear: number | null;
  genres: string[];
  platforms: string[];
  communityRating: number | null;
  /** מזינים את מיפוי הארכיטיפים (§4.4) — ראה lib/sessionProfile. */
  themes: string[];
  keywords: string[];
};

export type IgdbSearchOptions = {
  limit?: number;
  signal?: AbortSignal;
};

/**
 * הממשק היחיד שה-UI מכיר.
 * בשלב 1 ממומש ע"י mockGateway; משלב 2 ע"י httpGateway מול פרוקסי,
 * ובשלב 4 אותו httpGateway מול Supabase Edge Function — החלפת URL בלבד.
 */
export interface IgdbGateway {
  readonly kind: 'mock' | 'http';
  searchGames(query: string, options?: IgdbSearchOptions): Promise<IgdbGame[]>;
}

export class IgdbNotConfiguredError extends Error {
  constructor() {
    super('IGDB gateway is not configured');
    this.name = 'IgdbNotConfiguredError';
  }
}
