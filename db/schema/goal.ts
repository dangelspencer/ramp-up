import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const goals = sqliteTable('goals', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workoutsPerWeek: integer('workouts_per_week').notNull(),
  totalWeeks: integer('total_weeks'), // null for indefinite
  scheduledDays: text('scheduled_days').notNull(), // JSON array: "[0,2,4]" for Mon/Wed/Fri
  reminderTime: text('reminder_time'), // "18:00"
  startDate: text('start_date')
    .default(sql`(datetime('now'))`)
    .notNull(),
  currentStreak: integer('current_streak').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
