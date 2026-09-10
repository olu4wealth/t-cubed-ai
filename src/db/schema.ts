import { pgTable, uuid, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';

export const gameSessions = pgTable('game_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  playerId: text('player_id').notNull(),
  mode: text('mode').notNull(),
  book: text('book').notNull().default('all'),
  status: text('status').notNull().default('active'),
  difficulty: integer('difficulty').notNull().default(1),
  currentQuestion: text('current_question').notNull(),
  answers: jsonb('answers').$type<{questionId: string; selected: string; correct: boolean; book: string; chapter: number; topic: string; difficulty: number}[]>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});
