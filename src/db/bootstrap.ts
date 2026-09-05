import { eq } from 'drizzle-orm';

import { db } from './client';
import { users } from './schema';

/** ב-MVP יש משתמש מקומי אחד. Supabase Auth מחליף את זה בשלב 4. */
export const LOCAL_USER_ID = 'local-user';

export async function ensureLocalUser(): Promise<void> {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, LOCAL_USER_ID));
  if (existing.length > 0) return;

  await db.insert(users).values({
    id: LOCAL_USER_ID,
    createdAt: new Date(),
  });
}
