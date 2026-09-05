import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';

import migrations from '../../drizzle/migrations';
import { ensureLocalUser } from './bootstrap';
import { db } from './client';

type DatabaseReadyState = {
  ready: boolean;
  error: Error | null;
};

/**
 * מריץ מיגרציות ומוודא שקיים משתמש מקומי — פעם אחת, בעליית האפליקציה,
 * לפני שמסך ההחלטה מוצג. ככה אין ספינר בזרימה הקדושה (§3.2/§3.3).
 */
export function useDatabaseReady(): DatabaseReadyState {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success || seeded) return;
    let cancelled = false;
    ensureLocalUser()
      .then(() => {
        if (!cancelled) setSeeded(true);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setSeedError(cause instanceof Error ? cause : new Error(String(cause)));
      });
    return () => {
      cancelled = true;
    };
  }, [success, seeded]);

  return { ready: success && seeded, error: error ?? seedError };
}
