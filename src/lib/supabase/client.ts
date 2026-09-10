import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

let cached: SupabaseClient | null = null;

/**
 * נקודת הכניסה היחידה ל-Supabase. `null` אם לא הוגדרו משתני הסביבה —
 * הקוד הקורא חייב לבדוק `isSupabaseConfigured()` (או את ה-null הזה)
 * ולהתנהג בדיוק כמו לפני שלב 4 (offline-only), לא לקרוס.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return cached;
};

export { isSupabaseConfigured };
