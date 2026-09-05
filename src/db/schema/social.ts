import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { games } from './catalog';
import { users } from './user';

/**
 * friends / game_nights — Game Night הוא פרימיום (§3.8) ולא נבנה ב-MVP.
 * הטבלאות קיימות בסכמה בלבד, לפי §6, כדי שלא נצטרך מיגרציה מאוחרת.
 */
export const friends = sqliteTable('friends', {
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  friendId: text('friend_id').notNull(),
  status: text('status').notNull().default('pending'),
});

export const gameNights = sqliteTable('game_nights', {
  id: text('id').primaryKey(),
  hostId: text('host_id')
    .notNull()
    .references(() => users.id),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }).notNull(),
  participants: text('participants', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  chosenGameId: text('chosen_game_id').references(() => games.id),
});
