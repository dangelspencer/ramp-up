import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

export const barbells = sqliteTable('barbells', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),
  name: text('name').notNull(),
  weight: real('weight').notNull(), // in lbs
  description: text('description'), // e.g., "Standard 7ft/20kg bar"
  displayOrder: integer('display_order').default(0), // controls display order in lists
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
