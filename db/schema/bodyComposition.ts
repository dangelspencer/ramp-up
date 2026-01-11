import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

export const bodyCompositions = sqliteTable('body_compositions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),
  date: text('date')
    .default(sql`(datetime('now'))`)
    .notNull(),
  weight: real('weight').notNull(), // lbs
  waist: real('waist'), // inches
  neck: real('neck'), // inches
  hip: real('hip'), // inches (for women)
  bodyFatPercent: real('body_fat_percent'), // calculated
  bmi: real('bmi'), // calculated
  leanMass: real('lean_mass'), // calculated
  syncedToHealth: integer('synced_to_health', { mode: 'boolean' }).default(false),
});

export type BodyComposition = typeof bodyCompositions.$inferSelect;
export type NewBodyComposition = typeof bodyCompositions.$inferInsert;
