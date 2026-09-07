import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';

import migrations from '../../drizzle/migrations';
import { ensureLocalUser } from './bootstrap';
import { dbReady } from './client';

type DatabaseReadyState = {
  ready: boolean;
  error: Error | null;
};

/**
 * גרסת web: מחכה שה-Promise של openDatabaseAsync (ב-client.web.ts) ייגמר
 * לפני שמריצים מיגרציות, ורק אז קוראים ל-ensureLocalUser — כדי שלא ניגע
 * ב-db לפני שהוא מוכן. useMigrations הרגיל (drizzle-orm/expo-sqlite/migrator)
 * לא מתאים כאן כי ה-useEffect שלו רץ פעם אחת בלבד עם ה-db של הרינדור
 * הראשון, ולא "מתעדכן" אם db מגיע מאוחר יותר.
 */
export function useDatabaseReady(): DatabaseReadyState {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    dbReady
      .then((db) => migrate(db, migrations))
      .then(() => ensureLocalUser())
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause : new Error(String(cause)));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error };
}
