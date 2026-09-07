import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'playnight.db';

/** SQLite הוא מקור האמת. Supabase נכנס כ-sync ברקע רק בשלב 4. */
export const sqliteDb = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

export const db = drizzle(sqliteDb, { schema });

/** קיים גם ב-client.web.ts (שם זה ממתין לפתיחה אסינכרונית) לצורך API אחיד. */
export const dbReady: Promise<typeof db> = Promise.resolve(db);

export type Database = typeof db;
