import { and, eq, isNotNull, ne } from 'drizzle-orm';

import { LOCAL_USER_ID } from '../bootstrap';
import { db } from '../client';
import { sessions } from '../schema';

/** כמה סשנים נרשמו אי-פעם — §5 מציג את ה-paywall רק אחרי הסשן הראשון. */
export async function getTotalSessionsCount(): Promise<number> {
  const rows = await db.select({ id: sessions.id }).from(sessions).where(eq(sessions.userId, LOCAL_USER_ID));
  return rows.length;
}

/** כמה הערות "איפה עצרתי" יש בסך הכל — מגבלת 20 בחינם (§5). */
export async function countStoppedNotes(): Promise<number> {
  const rows = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(
      and(eq(sessions.userId, LOCAL_USER_ID), isNotNull(sessions.stoppedNote), ne(sessions.stoppedNote, ''))
    );
  return rows.length;
}
