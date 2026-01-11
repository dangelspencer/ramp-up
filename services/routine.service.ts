import { eq, asc } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  routines,
  routineExercises,
  routineExerciseSets,
  exercises,
  Routine,
  NewRoutine,
  RoutineExercise,
  RoutineExerciseSet,
  NewRoutineExercise,
  NewRoutineExerciseSet,
} from '@/db/schema';

export interface RoutineSetInput {
  weightType: 'percentage' | 'fixed' | 'bar';
  weightValue: number;
  reps: number;
  restTime?: number | null;
}

export interface RoutineExerciseInput {
  exerciseId: string;
  sets: RoutineSetInput[];
}

export interface RoutineWithDetails extends Routine {
  exercises: Array<{
    id: string;
    exerciseId: string;
    orderIndex: number;
    exercise: {
      id: string;
      name: string;
      maxWeight: number;
      weightIncrement: number;
      defaultRestTime: number | null;
      barbellId: string | null;
    };
    sets: Array<{
      id: string;
      orderIndex: number;
      weightType: 'percentage' | 'fixed' | 'bar';
      weightValue: number;
      reps: number;
      restTime: number | null;
    }>;
  }>;
}

export const routineService = {
  /**
   * Get all routines
   */
  async getAll(): Promise<Routine[]> {
    return db.select().from(routines).orderBy(routines.name);
  },

  /**
   * Get a routine by ID
   */
  async getById(id: string): Promise<Routine | undefined> {
    const results = await db.select().from(routines).where(eq(routines.id, id));
    return results[0];
  },

  /**
   * Get a routine with all its exercises and sets
   */
  async getByIdWithDetails(id: string): Promise<RoutineWithDetails | undefined> {
    const routine = await this.getById(id);
    if (!routine) return undefined;

    // Get routine exercises with their exercise details
    const routineExerciseResults = await db
      .select({
        routineExercise: routineExercises,
        exercise: {
          id: exercises.id,
          name: exercises.name,
          maxWeight: exercises.maxWeight,
          weightIncrement: exercises.weightIncrement,
          defaultRestTime: exercises.defaultRestTime,
          barbellId: exercises.barbellId,
        },
      })
      .from(routineExercises)
      .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
      .where(eq(routineExercises.routineId, id))
      .orderBy(asc(routineExercises.orderIndex));

    // Get all sets for these routine exercises
    const routineExerciseIds = routineExerciseResults.map((r) => r.routineExercise.id);
    const allSets =
      routineExerciseIds.length > 0
        ? await db
            .select()
            .from(routineExerciseSets)
            .orderBy(asc(routineExerciseSets.orderIndex))
        : [];

    // Build the detailed structure
    const exercisesWithSets = routineExerciseResults.map((r) => {
      const sets = allSets.filter((s) => s.routineExerciseId === r.routineExercise.id);
      return {
        id: r.routineExercise.id,
        exerciseId: r.routineExercise.exerciseId,
        orderIndex: r.routineExercise.orderIndex,
        exercise: r.exercise,
        sets: sets.map((s) => ({
          id: s.id,
          orderIndex: s.orderIndex,
          weightType: s.weightType as 'percentage' | 'fixed' | 'bar',
          weightValue: s.weightValue,
          reps: s.reps,
          restTime: s.restTime,
        })),
      };
    });

    return {
      ...routine,
      exercises: exercisesWithSets,
    };
  },

  /**
   * Create a new routine with exercises and sets
   */
  async create(
    name: string,
    exercisesInput: RoutineExerciseInput[]
  ): Promise<Routine> {
    // Create the routine
    const [routine] = await db.insert(routines).values({ name }).returning();

    // Create routine exercises and sets
    for (let i = 0; i < exercisesInput.length; i++) {
      const exerciseInput = exercisesInput[i];

      // Create routine exercise
      const [routineExercise] = await db
        .insert(routineExercises)
        .values({
          routineId: routine.id,
          exerciseId: exerciseInput.exerciseId,
          orderIndex: i,
        })
        .returning();

      // Create sets for this exercise
      for (let j = 0; j < exerciseInput.sets.length; j++) {
        const setInput = exerciseInput.sets[j];
        await db.insert(routineExerciseSets).values({
          routineExerciseId: routineExercise.id,
          orderIndex: j,
          weightType: setInput.weightType,
          weightValue: setInput.weightValue,
          reps: setInput.reps,
          restTime: setInput.restTime,
        });
      }
    }

    return routine;
  },

  /**
   * Update a routine's name
   */
  async updateName(id: string, name: string): Promise<Routine | undefined> {
    const results = await db
      .update(routines)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(routines.id, id))
      .returning();

    return results[0];
  },

  /**
   * Replace all exercises in a routine
   */
  async updateExercises(
    routineId: string,
    exercisesInput: RoutineExerciseInput[]
  ): Promise<void> {
    // Delete existing exercises (cascade deletes sets)
    await db
      .delete(routineExercises)
      .where(eq(routineExercises.routineId, routineId));

    // Create new exercises and sets
    for (let i = 0; i < exercisesInput.length; i++) {
      const exerciseInput = exercisesInput[i];

      const [routineExercise] = await db
        .insert(routineExercises)
        .values({
          routineId,
          exerciseId: exerciseInput.exerciseId,
          orderIndex: i,
        })
        .returning();

      for (let j = 0; j < exerciseInput.sets.length; j++) {
        const setInput = exerciseInput.sets[j];
        await db.insert(routineExerciseSets).values({
          routineExerciseId: routineExercise.id,
          orderIndex: j,
          weightType: setInput.weightType,
          weightValue: setInput.weightValue,
          reps: setInput.reps,
          restTime: setInput.restTime,
        });
      }
    }

    // Update routine timestamp
    await db
      .update(routines)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(routines.id, routineId));
  },

  /**
   * Delete a routine
   */
  async delete(id: string): Promise<boolean> {
    const results = await db.delete(routines).where(eq(routines.id, id)).returning();
    return results.length > 0;
  },

  /**
   * Duplicate a routine with a new name
   */
  async duplicate(id: string, newName: string): Promise<Routine | undefined> {
    const original = await this.getByIdWithDetails(id);
    if (!original) return undefined;

    const exercisesInput: RoutineExerciseInput[] = original.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      sets: e.sets.map((s) => ({
        weightType: s.weightType,
        weightValue: s.weightValue,
        reps: s.reps,
        restTime: s.restTime,
      })),
    }));

    return this.create(newName, exercisesInput);
  },
};
