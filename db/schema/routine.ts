import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { exercises } from './exercise';

export const routines = sqliteTable('routines', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),
  name: text('name').notNull(),
  createdAt: text('created_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
});

export const routineExercises = sqliteTable('routine_exercises', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),
  routineId: text('routine_id')
    .notNull()
    .references(() => routines.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id')
    .notNull()
    .references(() => exercises.id),
  orderIndex: integer('order_index').notNull(),
});

export const routineExerciseSets = sqliteTable('routine_exercise_sets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),
  routineExerciseId: text('routine_exercise_id')
    .notNull()
    .references(() => routineExercises.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull(),
  weightType: text('weight_type', { enum: ['percentage', 'fixed', 'bar'] }).notNull(),
  weightValue: real('weight_value').notNull(), // percentage (60) or absolute (45)
  reps: integer('reps').notNull(),
  restTime: integer('rest_time'), // null = use exercise default
});

export type Routine = typeof routines.$inferSelect;
export type NewRoutine = typeof routines.$inferInsert;
export type RoutineExercise = typeof routineExercises.$inferSelect;
export type NewRoutineExercise = typeof routineExercises.$inferInsert;
export type RoutineExerciseSet = typeof routineExerciseSets.$inferSelect;
export type NewRoutineExerciseSet = typeof routineExerciseSets.$inferInsert;
