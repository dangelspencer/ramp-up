import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const barbells = sqliteTable('barbells', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  weight: real('weight').notNull(), // in lbs
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
});

export type Barbell = typeof barbells.$inferSelect;
export type NewBarbell = typeof barbells.$inferInsert;
