import { eq, asc } from 'drizzle-orm';

import { db } from '@/db/client';
import { barbells, Barbell, NewBarbell } from '@/db/schema';

export const barbellService = {
  /**
   * Get all barbells ordered by displayOrder
   */
  async getAll(): Promise<Barbell[]> {
    return db.select().from(barbells).orderBy(asc(barbells.displayOrder), asc(barbells.name));
  },

  /**
   * Get a barbell by ID
   */
  async getById(id: string): Promise<Barbell | undefined> {
    const results = await db.select().from(barbells).where(eq(barbells.id, id));
    return results[0];
  },

  /**
   * Get the default barbell
   */
  async getDefault(): Promise<Barbell | undefined> {
    const results = await db
      .select()
      .from(barbells)
      .where(eq(barbells.isDefault, true));
    return results[0];
  },

  /**
   * Create a new barbell
   */
  async create(barbell: NewBarbell): Promise<Barbell> {
    // If this is being set as default, unset any existing default
    if (barbell.isDefault) {
      await db
        .update(barbells)
        .set({ isDefault: false })
        .where(eq(barbells.isDefault, true));
    }

    const results = await db.insert(barbells).values(barbell).returning();
    return results[0];
  },

  /**
   * Update a barbell
   */
  async update(
    id: string,
    updates: Partial<Omit<NewBarbell, 'id'>>
  ): Promise<Barbell | undefined> {
    // If this is being set as default, unset any existing default
    if (updates.isDefault) {
      await db
        .update(barbells)
        .set({ isDefault: false })
        .where(eq(barbells.isDefault, true));
    }

    const results = await db
      .update(barbells)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(barbells.id, id))
      .returning();

    return results[0];
  },

  /**
   * Delete a barbell
   */
  async delete(id: string): Promise<boolean> {
    const results = await db.delete(barbells).where(eq(barbells.id, id)).returning();
    return results.length > 0;
  },

  /**
   * Set a barbell as the default
   */
  async setDefault(id: string): Promise<Barbell | undefined> {
    // Unset any existing default
    await db
      .update(barbells)
      .set({ isDefault: false })
      .where(eq(barbells.isDefault, true));

    // Set the new default
    return this.update(id, { isDefault: true });
  },
};
