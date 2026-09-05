import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { games } from './catalog';

/** users (SPEC §6). ב-MVP יש משתמש מקומי יחיד; Supabase Auth נכנס בשלב 4. */
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  isPro: integer('is_pro', { mode: 'boolean' }).notNull().default(false),
  defaultSessionMinutes: integer('default_session_minutes').notNull().default(60),
  primaryPlatforms: text('primary_platforms', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  optedOutOfCalibration: integer('opted_out_of_calibration', { mode: 'boolean' })
    .notNull()
    .default(false),
});

export const USER_GAME_STATUSES = [
  'playing',
  'backlog',
  'beaten',
  'completed',
  'shelved',
  'abandoned',
] as const;

export type UserGameStatus = (typeof USER_GAME_STATUSES)[number];

/** user_games — העותק של המשתמש למשחק מסוים, על פלטפורמה מסוימת (SPEC §6). */
export const userGames = sqliteTable('user_games', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  gameId: text('game_id')
    .notNull()
    .references(() => games.id),
  status: text('status').$type<UserGameStatus>().notNull().default('backlog'),
  platform: text('platform'),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
  lastPlayedAt: integer('last_played_at', { mode: 'timestamp' }),
  hoursPlayed: real('hours_played').notNull().default(0),
  progressPercent: integer('progress_percent'),
  isHidden: integer('is_hidden', { mode: 'boolean' }).notNull().default(false),
  dismissedUntil: integer('dismissed_until', { mode: 'timestamp' }),
});

export type UserRow = typeof users.$inferSelect;
export type UserGameRow = typeof userGames.$inferSelect;
export type NewUserGameRow = typeof userGames.$inferInsert;
