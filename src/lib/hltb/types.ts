/** התוצאה המנורמלית שהאפליקציה מכירה — "זמן להשלמה" (§3.6/§3.7). */
export type HltbMatch = {
  hltbId: number;
  name: string;
  mainStoryMinutes: number | null;
  mainExtraMinutes: number | null;
  completionistMinutes: number | null;
};

/**
 * הממשק היחיד שה-UI/repositories מכירים. HLTB הוא אך ורק תוספת תצוגה —
 * לא ב-sessionFit (§4.4), לא במנוע ההמלצה. כישלון כאן אף פעם לא אמור
 * לחסום פיצ'ר אחר.
 */
export interface HltbGateway {
  readonly kind: 'mock' | 'http';
  search(query: string): Promise<HltbMatch[]>;
}

export class HltbNotConfiguredError extends Error {
  constructor() {
    super('HLTB gateway is not configured');
    this.name = 'HltbNotConfiguredError';
  }
}
