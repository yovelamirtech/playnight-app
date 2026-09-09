import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * games — קטלוג משותף, cached (SPEC §6).
 * typical_session_minutes / interruptible מתחילים מברירת מחדל לפי ז'אנר (§4.4)
 * ומתעדכנים מנתוני המשתמשים.
 */
export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  igdbId: integer('igdb_id'),
  name: text('name').notNull(),
  coverUrl: text('cover_url'),
  releaseYear: integer('release_year'),
  genres: text('genres', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  platforms: text('platforms', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  communityRating: real('community_rating'),
  typicalSessionMinutes: integer('typical_session_minutes').notNull().default(40),
  interruptible: integer('interruptible', { mode: 'boolean' }).notNull().default(false),
  sessionReportsCount: integer('session_reports_count').notNull().default(0),
  interruptibleReportsCount: integer('interruptible_reports_count').notNull().default(0),
  isCalibrated: integer('is_calibrated', { mode: 'boolean' }).notNull().default(false),
  // "זמן להשלמה" (§3.6/§3.7) — HowLongToBeat, לא-רשמי. null = עוד לא נבדק
  // או לא נמצאה התאמה; hltbLookedUpAt מסמן שהניסיון קרה כדי לא לשלוח
  // בקשה חוזרת על כל משחק בכל טעינה (§4.3 "אל תיתקע פה", אותו עיקרון).
  hltbMainStoryMinutes: integer('hltb_main_story_minutes'),
  hltbMainExtraMinutes: integer('hltb_main_extra_minutes'),
  hltbCompletionistMinutes: integer('hltb_completionist_minutes'),
  hltbLookedUpAt: integer('hltb_looked_up_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type GameRow = typeof games.$inferSelect;
export type NewGameRow = typeof games.$inferInsert;
