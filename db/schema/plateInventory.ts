import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const plateInventory = sqliteTable('plate_inventory', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weight: real('weight').notNull().unique(), // plate weight in lbs
  count: integer('count').notNull().default(0), // total plates (pairs = count/2)
});

export type PlateInventoryItem = typeof plateInventory.$inferSelect;
export type NewPlateInventoryItem = typeof plateInventory.$inferInsert;
