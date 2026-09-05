import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'playnight.db';

/** SQLite הוא מקור האמת. Supabase נכנס כ-sync ברקע רק בשלב 4. */
export const sqliteDb = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

export const db = drizzle(sqliteDb, { schema });

export type Database = typeof db;
