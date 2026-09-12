import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect } from 'react';

import { LOCAL_USER_ID } from '@/db/bootstrap';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { setIsPro } from '@/db/repositories/proRepo';

import { isRevenueCatConfigured } from './config';
import { getRevenueCatGateway } from './index';

/**
 * `users.isPro` (SQLite) הוא מקור האמת (AGENTS.md כלל 4) — ה-hook קורא
 * אותו כ-live query, ומאזין במקביל לשינויי customer status מ-RevenueCat
 * (רכישה/חידוש/ביטול/restore) כדי לכתוב אותם חזרה ל-DB. אם RevenueCat לא
 * מוגדר (config.ts), רק הקריאה המקומית פעילה — `isPro` פשוט נשאר `false`.
 */
export function useIsPro(): boolean {
  const { data } = useLiveQuery(
    db.select({ isPro: users.isPro }).from(users).where(eq(users.id, LOCAL_USER_ID))
  );

  useEffect(() => {
    if (!isRevenueCatConfigured()) return;
    let cancelled = false;
    const gateway = getRevenueCatGateway();

    gateway
      .configure()
      .then(() => gateway.getCustomerStatus())
      .then((status) => {
        if (!cancelled) void setIsPro(status.isPro);
      })
      .catch(() => undefined);

    const unsubscribe = gateway.onCustomerStatusChange((status) => {
      void setIsPro(status.isPro);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return data[0]?.isPro ?? false;
}
