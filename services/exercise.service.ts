import { eq, desc } from 'drizzle-orm';

import { db } from '@/db/client';
import { exercises, Exercise, NewExercise, barbells } from '@/db/schema';

export interface ExerciseWithBarbell extends Exercise {
  barbell?: {
    id: string;
    name: string;
    weight: number;
  } | null;
}

export const exerciseService = {
  /**
   * Get all exercises
   */
  async getAll(): Promise<Exercise[]> {
    return db.select().from(exercises).orderBy(exercises.name);
  },

  /**
   * Get all exercises with their associated barbell info
   */
  async getAllWithBarbell(): Promise<ExerciseWithBarbell[]> {
    const results = await db
      .select({
        exercise: exercises,
        barbell: {
          id: barbells.id,
          name: barbells.name,
          weight: barbells.weight,
        },
      })
      .from(exercises)
      .leftJoin(barbells, eq(exercises.barbellId, barbells.id))
      .orderBy(exercises.name);

    return results.map((r) => ({
      ...r.exercise,
      barbell: r.barbell,
    }));
  },

  /**
   * Get an exercise by ID
   */
  async getById(id: string): Promise<Exercise | undefined> {
    const results = await db.select().from(exercises).where(eq(exercises.id, id));
    return results[0];
  },

  /**
   * Get an exercise by ID with barbell info
   */
  async getByIdWithBarbell(id: string): Promise<ExerciseWithBarbell | undefined> {
    const results = await db
      .select({
        exercise: exercises,
        barbell: {
          id: barbells.id,
          name: barbells.name,
          weight: barbells.weight,
        },
      })
      .from(exercises)
      .leftJoin(barbells, eq(exercises.barbellId, barbells.id))
      .where(eq(exercises.id, id));

    if (results.length === 0) return undefined;

    return {
      ...results[0].exercise,
      barbell: results[0].barbell,
    };
  },

  /**
   * Create a new exercise
   */
  async create(exercise: NewExercise): Promise<Exercise> {
    const results = await db.insert(exercises).values(exercise).returning();
    return results[0];
  },

  /**
   * Update an exercise
   */
  async update(
    id: string,
    updates: Partial<Omit<NewExercise, 'id'>>
  ): Promise<Exercise | undefined> {
    const results = await db
      .update(exercises)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(exercises.id, id))
      .returning();

    return results[0];
  },

  /**
   * Update the max weight for an exercise
   */
  async updateMaxWeight(id: string, newMaxWeight: number): Promise<Exercise | undefined> {
    return this.update(id, { maxWeight: newMaxWeight });
  },

  /**
   * Delete an exercise
   */
  async delete(id: string): Promise<boolean> {
    const results = await db.delete(exercises).where(eq(exercises.id, id)).returning();
    return results.length > 0;
  },

  /**
   * Search exercises by name
   */
  async searchByName(query: string): Promise<Exercise[]> {
    // Simple case-insensitive search
    const allExercises = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return allExercises.filter((e) => e.name.toLowerCase().includes(lowerQuery));
  },
};
