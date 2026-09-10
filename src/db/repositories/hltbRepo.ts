import { eq } from 'drizzle-orm';

import { getHltbGateway } from '@/lib/hltb';

import { db } from '../client';
import { games } from '../schema';

/**
 * העשרת "זמן להשלמה" (§3.6/§3.7) — best-effort, לעולם לא חוסם את זרימת
 * הוספת המשחק (§4.3 "אל תיתקע פה", אותו עיקרון כמו ייבוא Steam).
 * נקראת בלי await מה-caller; hltbLookedUpAt נכתב גם כשלא נמצאה התאמה,
 * כדי לא לשלוח בקשה חוזרת לאותו משחק בכל פעם.
 */
export async function enrichGameWithHltb(gameId: string, gameName: string): Promise<void> {
  try {
    const matches = await getHltbGateway().search(gameName);
    const best = matches.find((m) => m.name.toLowerCase() === gameName.toLowerCase()) ?? matches[0];

    await db
      .update(games)
      .set({
        hltbMainStoryMinutes: best?.mainStoryMinutes ?? null,
        hltbMainExtraMinutes: best?.mainExtraMinutes ?? null,
        hltbCompletionistMinutes: best?.completionistMinutes ?? null,
        hltbLookedUpAt: new Date(),
      })
      .where(eq(games.id, gameId));
  } catch {
    // כישלון (פרוקסי לא רץ, HLTB חסם/שינה API) — פשוט אין נתון. לא נזרק החוצה.
  }
}
