import { eq } from 'drizzle-orm';

import { LOCAL_USER_ID } from '../bootstrap';
import { db } from '../client';
import { users } from '../schema';

/** מעדכן את מקור האמת המקומי ל-Pro (AGENTS.md כלל 4) — Supabase sync כבר מכיר את השדה. */
export async function setIsPro(isPro: boolean): Promise<void> {
  await db.update(users).set({ isPro, updatedAt: new Date() }).where(eq(users.id, LOCAL_USER_ID));
}

export async function getIsPro(): Promise<boolean> {
  const rows = await db.select({ isPro: users.isPro }).from(users).where(eq(users.id, LOCAL_USER_ID));
  return rows[0]?.isPro ?? false;
}
