import { getCurrentSession, isSupabaseConfigured } from '@/lib/supabase';
import { setLastSyncedAt } from '@/lib/sync/lastSyncedAt';

import { pullRemoteChanges } from './syncPullRepo';
import { pushLocalChanges } from './syncPushRepo';

export type SyncResult =
  | { status: 'skipped' }
  | { status: 'success' }
  | { status: 'error'; message: string };

/**
 * §8 שלב 4 — נקודת הכניסה היחידה לסנכרון. push לפני pull בכוונה: כך
 * שינוי שקרה על המכשיר הזה תמיד מגיע ל-Supabase לפני שנמשוך בחזרה,
 * וה-LWW (§lib/sync/resolveConflict) לא "מפסיד" לגרסה מקומית ישנה
 * יותר שכבר הייתה שם. best-effort — כישלון לא הורס נתונים מקומיים,
 * ה-DB המקומי נשאר מקור האמת (AGENTS.md כלל 4).
 */
export async function syncNow(): Promise<SyncResult> {
  if (!isSupabaseConfigured()) return { status: 'skipped' };

  const session = await getCurrentSession();
  if (!session) return { status: 'skipped' };

  try {
    await pushLocalChanges(session.user.id);
    await pullRemoteChanges(session.user.id);
    await setLastSyncedAt(new Date());
    return { status: 'success' };
  } catch (cause) {
    return { status: 'error', message: cause instanceof Error ? cause.message : String(cause) };
  }
}
