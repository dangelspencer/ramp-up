import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

import { routines } from './routine';

export const programs = sqliteTable('programs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  type: text('type', { enum: ['continuous', 'finite'] }).notNull(),
  totalWorkouts: integer('total_workouts'), // null for continuous
  currentPosition: integer('current_position').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(false),
  completedAt: text('completed_at'), // null if not completed
  createdAt: text('created_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
});

export const programRoutines = sqliteTable('program_routines', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: text('program_id')
    .notNull()
    .references(() => programs.id, { onDelete: 'cascade' }),
  routineId: text('routine_id')
    .notNull()
    .references(() => routines.id),
  orderIndex: integer('order_index').notNull(),
});

export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;
export type ProgramRoutine = typeof programRoutines.$inferSelect;
export type NewProgramRoutine = typeof programRoutines.$inferInsert;
