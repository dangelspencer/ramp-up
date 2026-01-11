import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { barbells } from './barbell';

export const exercises = sqliteTable('exercises', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),
  name: text('name').notNull(),
  maxWeight: real('max_weight').notNull(), // in lbs
  weightIncrement: real('weight_increment').notNull().default(5), // 2.5 or 5
  autoProgression: integer('auto_progression', { mode: 'boolean' }).default(true),
  barbellId: text('barbell_id').references(() => barbells.id),
  defaultRestTime: integer('default_rest_time').default(90), // seconds
  createdAt: text('created_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
});

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
