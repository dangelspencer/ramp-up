import { eq, asc } from 'drizzle-orm';

import { db } from '@/db/client';
import { plateInventory, PlateInventoryItem, NewPlateInventoryItem } from '@/db/schema';
import {
  calculatePlates,
  PlateCalculation,
  PlateInventoryItem as CalcPlateItem,
} from '@/utils/calculations';

export const plateInventoryService = {
  /**
   * Get all plates in inventory (sorted by weight descending)
   */
  async getAll(): Promise<PlateInventoryItem[]> {
    const results = await db.select().from(plateInventory);
    return results.sort((a, b) => b.weight - a.weight);
  },

  /**
   * Get a plate by weight
   */
  async getByWeight(weight: number): Promise<PlateInventoryItem | undefined> {
    const results = await db
      .select()
      .from(plateInventory)
      .where(eq(plateInventory.weight, weight));
    return results[0];
  },

  /**
   * Add or update a plate in inventory
   */
  async setPlateCount(weight: number, count: number): Promise<PlateInventoryItem> {
    const existing = await this.getByWeight(weight);

    if (existing) {
      const [updated] = await db
        .update(plateInventory)
        .set({ count })
        .where(eq(plateInventory.weight, weight))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(plateInventory)
        .values({ weight, count })
        .returning();
      return created;
    }
  },

  /**
   * Increment plate count
   */
  async incrementCount(weight: number, amount: number = 2): Promise<PlateInventoryItem> {
    const existing = await this.getByWeight(weight);
    const currentCount = existing?.count ?? 0;
    return this.setPlateCount(weight, currentCount + amount);
  },

  /**
   * Decrement plate count (minimum 0)
   */
  async decrementCount(weight: number, amount: number = 2): Promise<PlateInventoryItem> {
    const existing = await this.getByWeight(weight);
    const currentCount = existing?.count ?? 0;
    const newCount = Math.max(0, currentCount - amount);
    return this.setPlateCount(weight, newCount);
  },

  /**
   * Remove a plate weight from inventory
   */
  async remove(weight: number): Promise<boolean> {
    const results = await db
      .delete(plateInventory)
      .where(eq(plateInventory.weight, weight))
      .returning();
    return results.length > 0;
  },

  /**
   * Calculate plates needed for a target weight using current inventory
   */
  async calculatePlatesForWeight(
    targetWeight: number,
    barWeight: number = 45
  ): Promise<PlateCalculation> {
    const inventory = await this.getAll();
    const calcInventory: CalcPlateItem[] = inventory.map((p) => ({
      weight: p.weight,
      count: p.count,
    }));

    return calculatePlates(targetWeight, barWeight, calcInventory);
  },

  /**
   * Reset inventory to default plates
   */
  async resetToDefaults(): Promise<void> {
    // Clear existing
    await db.delete(plateInventory);

    // Add default plates
    const defaults = [
      { weight: 45, count: 4 },
      { weight: 35, count: 2 },
      { weight: 25, count: 4 },
      { weight: 10, count: 4 },
      { weight: 5, count: 4 },
      { weight: 2.5, count: 4 },
    ];

    for (const plate of defaults) {
      await db.insert(plateInventory).values(plate);
    }
  },

  /**
   * Update multiple plates at once
   */
  async updateMany(plates: Array<{ weight: number; count: number }>): Promise<void> {
    for (const plate of plates) {
      await this.setPlateCount(plate.weight, plate.count);
    }
  },
};
