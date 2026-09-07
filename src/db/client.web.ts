import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'playnight.db';

/**
 * ב-web, expo-sqlite (wa-sqlite/OPFS) פותח את מסד הנתונים דרך Worker.
 * openDatabaseSync שולח בקשה סינכרונית ל-Worker ומחכה לו ב"busy-wait" עם
 * תקרת איטרציות — אבל ב-cold load ה-Worker עוד טוען ומקמפל את ה-wasm
 * (~620KB) ולא מספיק להגיב בזמן, אז הקריאה נכשלת עם "Sync operation
 * timeout" ומקריסה את כל האפליקציה (§ אין ErrorBoundary סביב ייבוא מודול).
 *
 * openDatabaseAsync פותרת את זה כי היא ממתינה כמו שצריך (Promise, לא
 * busy-wait). sqliteDb/db מתמלאים אחרי שהפתיחה מסתיימת; useDatabaseReady.web
 * הוא היחיד שקורא ל-migrate/ensureLocalUser, ומחכה ל-Promise הזה קודם —
 * וכל שאר הצרכנים (index.tsx, gamesRepo, וכו') רצים רק אחרי שהמסך הראשי
 * כבר מוצג (§_layout ready gate), כלומר אחרי ש-db כבר קיים.
 */
export let sqliteDb: SQLiteDatabase | undefined;
export let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export const dbReady: Promise<NonNullable<typeof db>> = openDatabaseAsync(DATABASE_NAME, {
  enableChangeListener: true,
}).then((opened) => {
  sqliteDb = opened;
  db = drizzle(opened, { schema });
  return db;
});

export type Database = NonNullable<typeof db>;
