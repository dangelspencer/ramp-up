import { eq, desc } from 'drizzle-orm';

import { db } from '@/db/client';
import { bodyCompositions, BodyComposition, NewBodyComposition } from '@/db/schema';
import { calculateUSNavyBodyFat, Gender } from '@/utils/calculations';
import { settingsService } from './settings.service';

export interface BodyCompositionInput {
  weight: number;
  waist?: number;
  neck?: number;
  hip?: number;
}

export const bodyCompositionService = {
  /**
   * Get all body composition entries (most recent first)
   */
  async getAll(): Promise<BodyComposition[]> {
    return db.select().from(bodyCompositions).orderBy(desc(bodyCompositions.date));
  },

  /**
   * Get the most recent body composition entry
   */
  async getLatest(): Promise<BodyComposition | undefined> {
    const results = await db
      .select()
      .from(bodyCompositions)
      .orderBy(desc(bodyCompositions.date))
      .limit(1);
    return results[0];
  },

  /**
   * Get a body composition entry by ID
   */
  async getById(id: string): Promise<BodyComposition | undefined> {
    const results = await db
      .select()
      .from(bodyCompositions)
      .where(eq(bodyCompositions.id, id));
    return results[0];
  },

  /**
   * Create a new body composition entry with auto-calculated metrics
   */
  async create(input: BodyCompositionInput): Promise<BodyComposition> {
    const settings = await settingsService.getAll();

    let bodyFatPercent: number | undefined;
    let bmi: number | undefined;
    let leanMass: number | undefined;

    // Calculate metrics if we have enough data
    if (input.weight && input.waist && input.neck) {
      try {
        const result = calculateUSNavyBodyFat({
          gender: settings.gender as Gender,
          heightInches: settings.height,
          weightLbs: input.weight,
          waistInches: input.waist,
          neckInches: input.neck,
          hipInches: input.hip,
        });

        bodyFatPercent = result.bodyFatPercent;
        bmi = result.bmi;
        leanMass = result.leanMass;
      } catch {
        // If calculation fails (e.g., missing hip for female), just store the raw data
      }
    } else if (input.weight && settings.height) {
      // At minimum, calculate BMI
      bmi =
        Math.round((input.weight / (settings.height * settings.height)) * 703 * 10) /
        10;
    }

    const [entry] = await db
      .insert(bodyCompositions)
      .values({
        weight: input.weight,
        waist: input.waist,
        neck: input.neck,
        hip: input.hip,
        bodyFatPercent,
        bmi,
        leanMass,
      })
      .returning();

    return entry;
  },

  /**
   * Update a body composition entry
   */
  async update(
    id: string,
    input: BodyCompositionInput
  ): Promise<BodyComposition | undefined> {
    const settings = await settingsService.getAll();

    let bodyFatPercent: number | undefined;
    let bmi: number | undefined;
    let leanMass: number | undefined;

    // Recalculate metrics
    if (input.weight && input.waist && input.neck) {
      try {
        const result = calculateUSNavyBodyFat({
          gender: settings.gender as Gender,
          heightInches: settings.height,
          weightLbs: input.weight,
          waistInches: input.waist,
          neckInches: input.neck,
          hipInches: input.hip,
        });

        bodyFatPercent = result.bodyFatPercent;
        bmi = result.bmi;
        leanMass = result.leanMass;
      } catch {
        // If calculation fails, just store the raw data
      }
    } else if (input.weight && settings.height) {
      bmi =
        Math.round((input.weight / (settings.height * settings.height)) * 703 * 10) /
        10;
    }

    const results = await db
      .update(bodyCompositions)
      .set({
        weight: input.weight,
        waist: input.waist,
        neck: input.neck,
        hip: input.hip,
        bodyFatPercent,
        bmi,
        leanMass,
      })
      .where(eq(bodyCompositions.id, id))
      .returning();

    return results[0];
  },

  /**
   * Mark an entry as synced to Apple Health
   */
  async markSynced(id: string): Promise<void> {
    await db
      .update(bodyCompositions)
      .set({ syncedToHealth: true })
      .where(eq(bodyCompositions.id, id));
  },

  /**
   * Get entries that haven't been synced to Apple Health
   */
  async getUnsyncedEntries(): Promise<BodyComposition[]> {
    return db
      .select()
      .from(bodyCompositions)
      .where(eq(bodyCompositions.syncedToHealth, false));
  },

  /**
   * Delete a body composition entry
   */
  async delete(id: string): Promise<boolean> {
    const results = await db
      .delete(bodyCompositions)
      .where(eq(bodyCompositions.id, id))
      .returning();
    return results.length > 0;
  },

  /**
   * Get entries within a date range
   */
  async getInRange(startDate: string, endDate: string): Promise<BodyComposition[]> {
    const all = await this.getAll();
    return all.filter((entry) => {
      const date = new Date(entry.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  },
};
