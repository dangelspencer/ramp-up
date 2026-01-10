import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { programs } from './program';
import { routines } from './routine';
import { exercises } from './exercise';

export const workouts = sqliteTable('workouts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: text('program_id').references(() => programs.id),
  routineId: text('routine_id')
    .notNull()
    .references(() => routines.id),
  startedAt: text('started_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
  completedAt: text('completed_at'),
  notes: text('notes'),
});

export const workoutExercises = sqliteTable('workout_exercises', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workoutId: text('workout_id')
    .notNull()
    .references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id')
    .notNull()
    .references(() => exercises.id),
  orderIndex: integer('order_index').notNull(),
});

export const workoutSets = sqliteTable('workout_sets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workoutExerciseId: text('workout_exercise_id')
    .notNull()
    .references(() => workoutExercises.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull(),
  targetWeight: real('target_weight').notNull(),
  actualWeight: real('actual_weight'),
  targetReps: integer('target_reps').notNull(),
  actualReps: integer('actual_reps'),
  percentageOfMax: real('percentage_of_max'), // null for fixed weight sets
  restTime: integer('rest_time').notNull(),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  notes: text('notes'),
});

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type NewWorkoutSet = typeof workoutSets.$inferInsert;
