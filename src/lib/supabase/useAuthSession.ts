import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { getCurrentSession, onAuthStateChange } from './auth';
import { isSupabaseConfigured } from './config';

/** מצב ה-auth הנוכחי, לתצוגה במסך ההגדרות (§6 SPEC — "sync בין מכשירים"). */
export function useAuthSession(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    getCurrentSession().then((current) => {
      if (!cancelled) {
        setSession(current);
        setLoading(false);
      }
    });
    const unsubscribe = onAuthStateChange((next) => setSession(next));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { session, loading };
}
