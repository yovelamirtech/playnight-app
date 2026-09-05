import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { games } from './catalog';
import { users } from './user';

export const SESSION_RATINGS = ['loved', 'liked', 'meh', 'bored'] as const;
export type SessionRating = (typeof SESSION_RATINGS)[number];

/** sessions — סשן משחק בודד. could_stop_anytime מזין את §4.4. */
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  gameId: text('game_id')
    .notNull()
    .references(() => games.id),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  durationMinutes: integer('duration_minutes'),
  moodBefore: text('mood_before'),
  rating: text('rating').$type<SessionRating>(),
  stoppedNote: text('stopped_note'),
  couldStopAnytime: integer('could_stop_anytime', { mode: 'boolean' }),
  screenshotUrl: text('screenshot_url'),
});

/** calibration_answers — כל תשובה גולמית לשאלת כיול (§4.5). */
export const calibrationAnswers = sqliteTable('calibration_answers', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  gameId: text('game_id')
    .notNull()
    .references(() => games.id),
  sessionId: text('session_id').references(() => sessions.id),
  questionId: integer('question_id').notNull(),
  answerValue: text('answer_value').notNull(),
  answeredAt: integer('answered_at', { mode: 'timestamp' }).notNull(),
});

export const RECOMMENDATION_ACTIONS = ['accepted', 'dismissed', 'hidden'] as const;
export type RecommendationAction = (typeof RECOMMENDATION_ACTIONS)[number];

/** recommendations_log — לשיפור המנוע (§6). */
export const recommendationsLog = sqliteTable('recommendations_log', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  gameId: text('game_id')
    .notNull()
    .references(() => games.id),
  shownAt: integer('shown_at', { mode: 'timestamp' }).notNull(),
  score: real('score').notNull(),
  action: text('action').$type<RecommendationAction>(),
});

export type SessionRow = typeof sessions.$inferSelect;
export type NewSessionRow = typeof sessions.$inferInsert;
