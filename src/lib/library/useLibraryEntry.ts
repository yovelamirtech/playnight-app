import { useEffect, useState } from 'react';

import { getLibraryEntry } from '@/db/repositories/gamesRepo';
import type { LibraryEntry } from '@/db/repositories/gamesRepo';

type UseLibraryEntryResult = {
  entry: LibraryEntry | null;
  loading: boolean;
};

/**
 * טוען את רשומת הספרייה של userGameId נתון, עם הגנה מפני race על unmount/שינוי id.
 * session-confirm/session-log/game-detail שכפלו את אותו useEffect בדיוק — זה מרכז אותו.
 */
export function useLibraryEntry(userGameId: string | null | undefined): UseLibraryEntryResult {
  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userGameId) return;
    let cancelled = false;
    getLibraryEntry(userGameId).then((result) => {
      if (cancelled) return;
      setEntry(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userGameId]);

  return { entry, loading };
}
